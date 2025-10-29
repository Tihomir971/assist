import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BSProduct } from '$lib/types/connectors/biznisoft';
import {
	type Database,
	type Enums,
	type TablesInsert,
	type MProductPoInsert,
	type MProductPoRow,
	type MProductpriceInsert,
	type MProductpriceRow,
	type MProductRow,
	type MStorageonhandInsert,
	type MStorageonhandRow,
	createSuccessResponse,
	createErrorResponse,
	ApiErrorCode,
	type ConnectorProductsReqData
} from '@tihomir971/assist-shared';
import { typedPost } from '$lib/ky';
import type { ApiResponse } from '@tihomir971/assist-shared/api/api-response.types';

// Add this export near the top or where types are defined
export type ErrorDetails = { productId?: number; step: string; message: string };

// Schema for the remote function
const getErpInfoSchema = z.object({
	ids: z.string()
});

export const getErpInfo = command(
	getErpInfoSchema,
	async ({ ids }): Promise<ApiResponse<{ updated: number }>> => {
		// Get the request event synchronously at the beginning
		const { locals } = getRequestEvent();
		const supabase: SupabaseClient<Database> = locals.supabase;
		console.log(`Starting ERP sync for product IDs: ${ids}`);
		const { data: skus } = await supabase
			.from('m_product')
			.select('sku')
			.in('id', ids.split(',').map(Number));

		if (!skus) {
			throw new Error('No products found for selected IDs');
		}

		const skuList = skus.map(({ sku }) => parseInt(sku || '0', 10));

		let resData: BSProduct[];
		try {
			const { data, error } = await typedPost<ConnectorProductsReqData, BSProduct[]>(
				'api/product',
				{
					skus: skuList
				}
			);
			if (error) {
				return { data, error };
			}
			resData = data;

			if (resData.length === 0) {
				throw new Error('No product data found in ERP for the selected SKUs.');
			}

			console.log(`Successfully fetched data for ${resData.length} products from ERP.`);
		} catch (error) {
			console.error('Error fetching data from ERP API:', error);
			throw new Error('Failed to fetch data from ERP API.');
		}

		const { data: mapChannel } = await supabase
			.from('c_channel_map')
			.select('*')
			.eq('c_channel_id', 1);

		const { data: mapCategory } = await supabase
			.from('c_channel_map_category')
			.select('m_product_category_id,resource_id')
			.eq('c_channel_id', 1);

		const errors: ErrorDetails[] = [];
		const productUpdates: { id: number; data: Partial<MProductRow> }[] = [];
		const barcodeInserts: TablesInsert<'m_product_packing'>[] = []; // Use Insert<>
		// Arrays for Product PO
		const productPoInserts: MProductPoInsert[] = []; // Use Insert<>
		const productPoUpdates: {
			where: { m_product_id: number; c_bpartner_id: number };
			data: Partial<MProductPoRow>;
		}[] = [];
		// Arrays for Stock
		const stockInserts: MStorageonhandInsert[] = []; // Use Insert<>
		const stockUpdates: {
			where: { m_product_id: number; warehouse_id: number };
			data: Partial<MStorageonhandRow>;
		}[] = [];
		// Arrays for Price
		const priceInserts: MProductpriceInsert[] = []; // Use Insert<>
		const priceUpdates: {
			where: { m_product_id: number; m_pricelist_version_id: number };
			data: Partial<MProductpriceRow>;
		}[] = [];

		// --- Pre-fetch Product IDs ---
		const erpSkus = resData.map((p) => p.sifra.toString()); // Use allErpProducts
		const { data: existingProducts, error: productFetchError } = await supabase
			.from('m_product')
			.select('id, sku')
			.in('sku', erpSkus);

		if (productFetchError) {
			console.error('Error fetching existing products by SKU:', productFetchError);
			throw new Error('Failed to fetch existing products.');
		}
		const productSkuToIdMap = new Map(
			existingProducts?.filter((p) => p.sku !== null).map((p) => [p.sku!, p.id])
		);

		// --- Pre-fetch BPartner Mappings ---
		const externalBPartnerIds = [
			...new Set(resData.flatMap((p) => p.m_product_po?.map((po) => po.kupac.toString()) ?? []))
		];
		const { data: bpartnerMappings, error: bpartnerMapError } = await supabase
			.from('c_channel_map_bpartner')
			.select('c_bpartner_id, resource_id')
			.eq('c_channel_id', 1)
			.in('resource_id', externalBPartnerIds);

		if (bpartnerMapError) {
			console.error('Error fetching BPartner mappings:', bpartnerMapError);
			throw new Error('Failed to fetch BPartner mappings.');
		}
		const bpartnerExternalToInternalMap = new Map(
			bpartnerMappings?.map((m) => [m.resource_id, m.c_bpartner_id])
		);

		// --- Pre-fetch existing related data for updates ---
		const productIds = Array.from(productSkuToIdMap.values());
		const [existingPoData, existingStockData, existingPriceData] = await Promise.all([
			supabase
				.from('m_product_po')
				.select('m_product_id, c_bpartner_id')
				.in('m_product_id', productIds),
			supabase
				.from('m_storageonhand')
				.select('m_product_id, warehouse_id')
				.in('m_product_id', productIds),
			supabase
				.from('m_productprice')
				.select('m_product_id, m_pricelist_version_id')
				.in('m_product_id', productIds)
		]);

		const existingPoSet = new Set(
			existingPoData.data?.map((p) => `${p.m_product_id}-${p.c_bpartner_id}`) ?? []
		);
		const existingStockSet = new Set(
			existingStockData.data?.map((s) => `${s.m_product_id}-${s.warehouse_id}`) ?? []
		);
		const existingPriceSet = new Set(
			existingPriceData.data?.map((p) => `${p.m_product_id}-${p.m_pricelist_version_id}`) ?? []
		);

		// --- Collect data for batch operations ---
		for (const product of resData) {
			const productId = productSkuToIdMap.get(product.sifra.toString());

			if (!productId) {
				errors.push({
					productId: undefined,
					step: 'find_product_by_sku',
					message: `Product not found for SKU ${product.sifra}`
				});
				continue; // Skip to the next product if internal ID not found
			}

			// --- Collect Product Update ---
			const uomID = mapChannel?.find(
				(item) => item.channel_code === product.jedmere && item.c_uom_id !== null
			)?.c_uom_id;
			const taxID = mapChannel?.find(
				(item) => item.channel_code === product.porez && item.c_taxcategory_id !== null
			)?.c_taxcategory_id;

			const categoryID = mapCategory?.find(
				(item) => Number(item.resource_id) === product.grupa
			)?.m_product_category_id;

			productUpdates.push({
				id: productId,
				data: {
					name: product.naziv,
					mpn: product.katbr ?? null,
					m_product_category_id: categoryID,
					c_uom_id: uomID ?? undefined,
					c_taxcategory_id: taxID ?? undefined,
					unitsperpack: product.tpkolicina ?? 1
				}
			});

			// --- Collect Barcode Inserts ---
			if (product.barcodes) {
				for (const element of product.barcodes) {
					barcodeInserts.push({
						m_product_id: productId,
						gtin: element,
						packing_type: 'Individual' as Enums<'PackingType'>,
						unitsperpack: 1, // Assuming default
						is_display: false // Added default
					});
				}
			}

			// --- Collect Product PO Inserts/Updates ---
			if (product.m_product_po) {
				for (const po of product.m_product_po) {
					const internalBPartnerId = bpartnerExternalToInternalMap.get(po.kupac.toString());
					if (internalBPartnerId) {
						const poData = {
							m_product_id: productId,
							c_bpartner_id: internalBPartnerId,
							vendorproductno: po.kupsif
						};
						const poKey = `${productId}-${internalBPartnerId}`;

						if (existingPoSet.has(poKey)) {
							productPoUpdates.push({
								where: { m_product_id: productId, c_bpartner_id: internalBPartnerId },
								data: {
									vendorproductno: po.kupsif,
									is_active: true
								}
							});
						} else {
							productPoInserts.push({
								...poData
							});
							// Add to set to prevent duplicate inserts in this batch
							existingPoSet.add(poKey);
						}
					} else {
						errors.push({
							productId: productId,
							step: 'find_bpartner_map',
							message: `BPartner mapping not found for external ID ${po.kupac}`
						});
					}
				}
			}

			// --- Collect Stock and Price Inserts/Updates ---
			if (product.trstanje) {
				for (const trstanje of product.trstanje) {
					const warehouseID = mapChannel?.find(
						(item) =>
							item.channel_code === trstanje.sifobj.toString() && item.m_warehouse_id !== null
					)?.m_warehouse_id;

					if (!warehouseID) {
						errors.push({
							productId: productId,
							step: 'find_warehouse_map',
							message: `Warehouse mapping not found for external ID ${trstanje.sifobj}`
						});
						continue; // Skip this record
					}

					// --- Collect Stock Insert/Update ---
					const stockKey = `${productId}-${warehouseID}`;
					const stockData = {
						m_product_id: productId,
						warehouse_id: warehouseID,
						qtyonhand: (trstanje.stanje ?? 0) - (trstanje.neprokkasa ?? 0),
						is_active: true
					};

					if (existingStockSet.has(stockKey)) {
						stockUpdates.push({
							where: { m_product_id: productId, warehouse_id: warehouseID },
							data: {
								qtyonhand: stockData.qtyonhand,
								// updated_at: stockData.updated_at,
								is_active: stockData.is_active
							}
						});
					} else {
						stockInserts.push({
							...stockData,
							// id: 0, // REMOVED - Let DB handle auto-increment
							// created_at: new Date().toISOString(), // REMOVED - Let DB handle default
							m_locator_id: null // Assuming nullable or default locator for insert
						});
						existingStockSet.add(stockKey); // Add to set to prevent duplicate inserts
					}

					// --- Collect Price Insert/Update (based on warehouse) ---
					let pricelistId: number | null = null;
					let price: number | null = null;

					if (trstanje.sifobj === 1) {
						// Assuming 1 maps to pricelist 5 (Purchase)
						pricelistId = 5;
						price = trstanje.nabcena;
					} else if (trstanje.sifobj === 11) {
						// Assuming 11 maps to pricelist 13 (Retail)
						pricelistId = 13;
						price = trstanje.mpcena;
					}

					if (pricelistId !== null && price !== null) {
						const priceKey = `${productId}-${pricelistId}`;
						const priceData = {
							m_product_id: productId,
							m_pricelist_version_id: pricelistId,
							pricestd: price,
							// updated_at: new Date().toISOString(),
							is_active: true // Required, default or from ERP?
						};

						if (existingPriceSet.has(priceKey)) {
							priceUpdates.push({
								where: { m_product_id: productId, m_pricelist_version_id: pricelistId },
								data: {
									pricestd: priceData.pricestd,
									// updated_at: priceData.updated_at,
									is_active: priceData.is_active
								}
							});
						} else {
							priceInserts.push({
								...priceData,
								// id: 0, // REMOVED - Let DB handle auto-increment
								// created_at: new Date().toISOString(), // REMOVED - Let DB handle default
								pricelimit: null, // Assuming nullable for insert
								pricelist: null // Assuming nullable for insert
							});
							existingPriceSet.add(priceKey); // Add to set
						}
					}
				}
			}
		}

		if (productUpdates.length > 0) {
			const { error: productUpdateError } = await supabase.rpc('bulk_update_products', {
				updates: productUpdates // Pass the array directly
			});
			if (productUpdateError) {
				console.error('Error calling bulk_update_products RPC:', productUpdateError);
				errors.push({
					step: 'update_product_rpc',
					message: `RPC failed: ${productUpdateError.message}`
				});
			}
		}

		// 2. Barcode Inserts (Handle specific duplicate GTIN error)
		// Filter potential duplicates within the batch itself first
		const uniqueBarcodeInserts = Array.from(
			new Map(barcodeInserts.map((item) => [`${item.m_product_id}-${item.gtin}`, item])).values()
		);
		if (uniqueBarcodeInserts.length > 0) {
			const { error: barcodeInsertError } = await supabase
				.from('m_product_packing')
				.insert(uniqueBarcodeInserts);

			if (barcodeInsertError) {
				// Check if it's the specific duplicate GTIN error (code 23505 for unique_violation)
				// and the constraint name matches.
				if (
					barcodeInsertError.code === '23505' &&
					barcodeInsertError.message.includes('m_product_packing_gtin_key')
				) {
					// Log the expected duplicate error but don't treat it as a failure for the user
					console.warn(
						'Ignoring duplicate GTIN error during barcode insert:',
						barcodeInsertError.message
					);
				} else {
					// Log and report other unexpected errors during barcode insertion
					console.error('Error batch inserting barcodes:', barcodeInsertError);
					errors.push({
						step: 'insert_barcode_batch',
						message: `Batch insert failed: ${barcodeInsertError.message}`
					});
				}
			}
		}

		// 3. Product PO Inserts
		if (productPoInserts.length > 0) {
			const { error: poInsertError } = await supabase.from('m_product_po').insert(productPoInserts);
			if (poInsertError) {
				console.error('Error batch inserting product POs:', poInsertError);
				errors.push({
					step: 'insert_product_po_batch',
					message: `Batch insert failed: ${poInsertError.message}`
				});
			}
		}

		if (productPoUpdates.length > 0) {
			const { error: poUpdateError } = await supabase.rpc('bulk_update_product_po', {
				updates: productPoUpdates
			});
			if (poUpdateError) {
				console.error('Error calling bulk_update_product_pos RPC:', poUpdateError);
				errors.push({
					step: 'update_product_po_rpc',
					message: `RPC failed: ${poUpdateError.message}`
				});
			}
		}

		// 5. Stock Inserts
		if (stockInserts.length > 0) {
			const { error: stockInsertError } = await supabase
				.from('m_storageonhand')
				.insert(stockInserts);
			if (stockInsertError) {
				console.error('Error batch inserting stock:', stockInsertError);
				errors.push({
					step: 'insert_stock_batch',
					message: `Batch insert failed: ${stockInsertError.message}`
				});
			}
		}

		if (stockUpdates.length > 0) {
			const { error: stockUpdateError } = await supabase.rpc('bulk_update_storageonhand', {
				updates: stockUpdates
			});
			if (stockUpdateError) {
				console.error('Error calling bulk_update_stock RPC:', stockUpdateError);
				errors.push({
					step: 'update_stock_rpc',
					message: `RPC failed: ${stockUpdateError.message}`
				});
			}
		}

		// 7. Price Inserts
		if (priceInserts.length > 0) {
			const { error: priceInsertError } = await supabase
				.from('m_productprice')
				.insert(priceInserts);
			if (priceInsertError) {
				console.error('Error batch inserting prices:', priceInsertError);
				errors.push({
					step: 'insert_price_batch',
					message: `Batch insert failed: ${priceInsertError.message}`
				});
			}
		}

		if (priceUpdates.length > 0) {
			const { error: priceUpdateError } = await supabase.rpc('bulk_update_productprice', {
				updates: priceUpdates
			});
			if (priceUpdateError) {
				console.error('Error calling bulk_update_prices RPC:', priceUpdateError);
				errors.push({
					step: 'update_price_rpc',
					message: `RPC failed: ${priceUpdateError.message}`
				});
			}
		}

		// Return result with any errors that occurred
		if (errors.length > 0) {
			return createErrorResponse(
				ApiErrorCode.RESOURCE_NOT_FOUND,
				'ERP sync completed with errors',
				undefined,
				{ errors }
			);
		}

		return createSuccessResponse({ updated: resData.length });
	}
);
