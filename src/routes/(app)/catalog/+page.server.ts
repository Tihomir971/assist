import type { Actions, PageServerLoad } from './$types';
import type { BSProduct } from '$lib/types/connectors/biznisoft.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FlattenedProduct, ProductWithDetails } from './columns.svelte.js';
import type {
	Database,
	Enums,
	MProductPoInsert,
	MProductPoRow,
	MProductpriceInsert,
	MProductpriceRow,
	MProductRow,
	MStorageonhandInsert,
	MStorageonhandRow,
	Tables,
	TablesInsert,
	TablesUpdate
} from '@tihomir971/assist-shared';
import type { ProductsResultSearch } from './types-search-vendor-products';
import type { ApiResponse } from '$lib/types/api.types';
import type { ProductRequest } from './types-api-market';

import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { isValidGTIN } from '$lib/scripts/gtin';
import { connector, scrapper } from '$lib/ky';
import { DateTime } from 'luxon';
import { productSelectSchema } from './schema';
import { sourceId } from './types';
import { catalogSearchParamsSchema } from './search-params.schema';
import { ProductStatus, type ProductResultGet } from './types-get-market-info';
import type { MPricelistVersionRow } from '@tihomir971/assist-shared';
import { CategoryService } from '$lib/services/supabase/category.service';

// Add this export near the top or where types are defined
export type ErrorDetails = { productId?: number; step: string; message: string };

export const load: PageServerLoad = async ({ depends, parent, url, locals: { supabase } }) => {
	depends('catalog:products');
	const params = catalogSearchParamsSchema.parse(Object.fromEntries(url.searchParams));
	const {
		report: selectedReport,
		vat: checkedVat,
		sub: showSubcategories,
		cat: categoryId = null,
		search: searchTerm
	} = params;

	const { activeWarehouse } = await parent();

	const [productsData, activePricelists] = await Promise.all([
		fetchProducts(supabase, categoryId ?? null, showSubcategories),
		getPriceLists(supabase)
	]);

	const products = filterAndFlattenProducts(
		productsData,
		selectedReport ?? null,
		activeWarehouse,
		checkedVat,
		activePricelists
	);

	return {
		products,
		searchTerm
	};
};

async function fetchProducts(
	supabase: SupabaseClient<Database>,
	categoryId: string | null,
	showSubcategories: boolean
) {
	let categoryIds: number[] = [];
	if (categoryId && showSubcategories) {
		// Create TreeCollection on-demand for efficient descendant lookup
		const categoryService = new CategoryService(supabase);
		const categoryTreeCollection = await categoryService.getCategoryTreeCollection();
		const descendantValues = categoryTreeCollection.getDescendantValues(categoryId);
		categoryIds = descendantValues.map((value: string) => parseInt(value));
	}
	let query = supabase
		.from('m_product')
		.select(
			`
			id,
			sku,
			name,
			is_active,
			mpn,
			unitsperpack,
			imageurl,
			discontinued,
			m_product_packing(
				packing_type,
				unitsperpack
			),
			c_taxcategory(
				c_tax(
					rate
				)
			),
			m_storageonhand(
				warehouse_id,
				qtyonhand
			),
			m_productprice(
				m_pricelist_version_id,
				pricestd,
				pricelist
			),
			m_replenish(
				m_warehouse_id,
				level_min,
				level_max,
				qtybatchsize,
				m_warehousesource_id
			),
			m_product_po(
				c_bpartner_id,
				pricelist,
				c_bpartner(
					display_name,
					iscustomer
				)
			),
			m_product_brands(
				name
			)
			`
		)
		.eq('producttype', 'I')
		// .eq('m_product_packing.product_type', 'Pack')
		.order('name');

	if (categoryIds.length > 0) {
		query = query.in('m_product_category_id', categoryIds);
	} else {
		if (categoryId) {
			query = query.eq('m_product_category_id', parseInt(categoryId));
		} else {
			query = query.is('m_product_category_id', null);
		}
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching products:', error);
		return [];
	}

	return data.filter((product) => {
		const hasStock = product.m_storageonhand.some((item) => item.qtyonhand > 0);
		return product.is_active || hasStock;
	});
}

async function getPriceLists(
	supabase: SupabaseClient<Database>
): Promise<Partial<Tables<'m_pricelist_version'>>[] | []> {
	const nowBelgrade = DateTime.now().setZone('Europe/Belgrade');
	const targetDate = nowBelgrade.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ");

	const { data } = await supabase
		.from('m_pricelist_version')
		.select('id')
		.eq('is_active', true)
		.eq('m_pricelist_id', 4)
		.or(`validfrom.lte.${targetDate},validfrom.is.null`)
		.or(`validto.gte.${targetDate},validto.is.null`);

	return data || [];
}

function filterAndFlattenProducts(
	products: ProductWithDetails[],
	selectedReport: string | null,
	activeWarehouse: number,
	checkedVat: boolean,
	activePricelists: Partial<MPricelistVersionRow>[] | []
): FlattenedProduct[] {
	let filteredProducts: ProductWithDetails[];
	if (selectedReport === 'relocation') {
		filteredProducts = products.filter((product) => {
			const m_replenishActiveWH = product.m_replenish.find(
				(item) => item.m_warehouse_id === activeWarehouse
			);
			const activeWarehouseStock =
				product.m_storageonhand.find((item) => item.warehouse_id === activeWarehouse)?.qtyonhand ||
				0;
			const sourceWarehouseStock =
				product.m_storageonhand.find(
					(item) => item.warehouse_id === m_replenishActiveWH?.m_warehousesource_id
				)?.qtyonhand || 0;

			return (
				m_replenishActiveWH &&
				m_replenishActiveWH.level_max !== undefined &&
				m_replenishActiveWH.qtybatchsize !== null &&
				m_replenishActiveWH.qtybatchsize !== undefined &&
				m_replenishActiveWH.level_max - activeWarehouseStock >= m_replenishActiveWH.qtybatchsize &&
				m_replenishActiveWH.qtybatchsize > 0 &&
				sourceWarehouseStock > 0
			);
		});
	} else if (selectedReport === 'replenish') {
		filteredProducts = products.filter((product) => {
			const m_replenishActiveWH = product.m_replenish.find(
				(item) => item.m_warehouse_id === activeWarehouse
			);
			const m_storageonhandActiveStock =
				product.m_storageonhand.find((item) => item.warehouse_id === activeWarehouse)?.qtyonhand ||
				0;
			return (
				m_replenishActiveWH &&
				m_replenishActiveWH.level_max !== undefined &&
				m_replenishActiveWH.qtybatchsize !== null &&
				m_replenishActiveWH.qtybatchsize !== undefined &&
				m_replenishActiveWH.level_max - m_storageonhandActiveStock >=
					m_replenishActiveWH.qtybatchsize &&
				m_replenishActiveWH.qtybatchsize > 0
			);
		});
	} else if (selectedReport === 'all') {
		filteredProducts = products;
	} else {
		filteredProducts = products.filter((product) => {
			const hasNonZeroStock = product.m_storageonhand.some((item) => item.qtyonhand !== 0);
			const activeWarehouseStock =
				product.m_storageonhand.find((item) => item.warehouse_id === activeWarehouse)?.qtyonhand ||
				0;

			const activeWarehouseLevelMax =
				product.m_replenish.find((item) => item.m_warehouse_id === activeWarehouse)?.level_max || 0;
			const activeWarehouseBatch =
				product.m_replenish.find((item) => item.m_warehouse_id === activeWarehouse)?.qtybatchsize ||
				0;

			return (
				hasNonZeroStock || activeWarehouseLevelMax - activeWarehouseBatch > activeWarehouseStock
			);
		});
	}

	return filteredProducts.map((product) =>
		flattenProduct(product, activeWarehouse, checkedVat, activePricelists)
	);
}

function flattenProduct(
	product: ProductWithDetails,
	activeWarehouse: number,
	checkedVat: boolean,
	activePricelists: TablesUpdate<'m_pricelist_version'>[]
): FlattenedProduct {
	const smallestPricestd = Math.min(
		...product.m_productprice
			.filter(
				(item) =>
					item.pricestd !== null &&
					activePricelists.some((pl) => pl.id === item.m_pricelist_version_id)
			)
			.map((item) => item.pricestd!)
	);

	const purchase =
		product.m_productprice.find((item) => item.m_pricelist_version_id === 5)?.pricestd ?? 0;
	const retail =
		product.m_productprice.find((item) => item.m_pricelist_version_id === 13)?.pricestd ?? 0;
	const tax = product.c_taxcategory?.c_tax?.[0]?.rate ?? 0;

	const storageLookup = new Map(
		product.m_storageonhand.map((item) => [item.warehouse_id, item.qtyonhand])
	);
	const getLevelMin = new Map(
		product.m_replenish.map((item) => [item.m_warehouse_id, item.level_min])
	);
	const getLevelMax = new Map(
		product.m_replenish.map((item) => [item.m_warehouse_id, item.level_max])
	);
	const getQtybatchsize = new Map(
		product.m_replenish.map((item) => [item.m_warehouse_id, item.qtybatchsize])
	);

	const marketPrices = product.m_product_po
		.filter((po) => po.c_bpartner.iscustomer)
		.map((po) => po.pricelist)
		.filter((value): value is number => value !== null && value > 0);

	const vendorPrices = product.m_product_po
		.filter((po) => !po.c_bpartner.iscustomer)
		.map((po) => po.pricelist)
		.filter((value): value is number => value !== null && value > 0);

	const minMarketPrice = marketPrices.length > 0 ? Math.min(...marketPrices) : 0;
	const minVendorPrice = vendorPrices.length > 0 ? Math.min(...vendorPrices) : 0;

	const priceRetail = Math.min(retail, smallestPricestd);
	const action = smallestPricestd < retail;

	const priceMarket = product.m_product_po.map((po) => ({
		display_name: po.c_bpartner.display_name,
		pricelist: po.pricelist,
		tax: tax ? tax / 100 : null,
		iscustomer: po.c_bpartner.iscustomer
	}));

	return {
		id: product.id,
		sku: product.sku,
		name: product.name,
		mpn: product.mpn,
		unitsperpack:
			product.m_product_packing.find((p) => p.packing_type === 'Pack')?.unitsperpack || null,
		imageurl: product.imageurl,
		discontinued: product.discontinued,
		taxRate: tax ? tax / 100 : null,
		qtyWholesale: storageLookup.get(2) ?? 0,
		qtyRetail: storageLookup.get(5) ?? 0,
		pricePurchase: checkedVat ? purchase * (1 + tax / 100) : purchase,
		ruc: (priceRetail / (1 + tax / 100) - purchase) / purchase,
		priceRetail: checkedVat ? priceRetail : priceRetail / (1 + tax / 100),
		levelMin: getLevelMin.get(activeWarehouse) ?? null,
		levelMax: getLevelMax.get(activeWarehouse) ?? null,
		qtybatchsize: getQtybatchsize.get(activeWarehouse) ?? null,
		// priceAgrofina: checkedVat ? agrofina * (1 + tax / 100) : agrofina,
		// priceMercator: checkedVat ? mercator * (1 + tax / 100) : mercator,
		// priceMivex: checkedVat ? mivex * (1 + tax / 100) : mivex,
		// priceCenoteka: checkedVat ? cenoteka * (1 + tax / 100) : cenoteka,
		// priceGros: checkedVat ? gros * (1 + tax / 100) : gros,
		priceMarketBest: checkedVat ? minMarketPrice * (1 + tax / 100) : minMarketPrice,
		priceVendorBest: checkedVat ? minVendorPrice * (1 + tax / 100) : minVendorPrice,
		brand: product.m_product_brands?.name || null,
		action,
		priceMarket: priceMarket.map((pm) => ({
			...pm,
			name: pm.display_name ?? 'N/A',
			iscustomer: pm.iscustomer ?? false
		}))
	};
}

export const actions = {
	getErpInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		const { data: skus } = await supabase
			.from('m_product')
			.select('sku')
			.in('id', form.data.ids.split(',').map(Number));

		if (!skus) {
			return fail(404, { message: 'No products found for selected IDs' });
		}

		const skuList = skus.map(({ sku }) => parseInt(sku || '0', 10));

		let erpResponse: BSProduct[];
		try {
			erpResponse = await connector
				.post('api/product', { json: { sku: skuList } })
				.json<BSProduct[]>();

			if (!erpResponse || erpResponse.length === 0) {
				return fail(404, { message: 'No product data found in ERP for the selected SKUs.' });
			}

			console.log(`Successfully fetched data for ${erpResponse.length} products from ERP.`);
		} catch (error) {
			console.error('Error fetching data from ERP API:', error);
			return fail(502, { message: 'Failed to fetch data from ERP API.' });
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
		const erpSkus = erpResponse.map((p) => p.sifra.toString()); // Use allErpProducts
		const { data: existingProducts, error: productFetchError } = await supabase
			.from('m_product')
			.select('id, sku')
			.in('sku', erpSkus);

		if (productFetchError) {
			console.error('Error fetching existing products by SKU:', productFetchError);
			return fail(500, {
				success: false,
				message: 'Failed to fetch existing products.',
				errors: [{ step: 'prefetch_products', message: productFetchError.message }]
			});
		}
		const productSkuToIdMap = new Map(
			existingProducts?.filter((p) => p.sku !== null).map((p) => [p.sku!, p.id])
		);

		// --- Pre-fetch BPartner Mappings ---
		const externalBPartnerIds = [
			...new Set(erpResponse.flatMap((p) => p.m_product_po?.map((po) => po.kupac.toString()) ?? []))
		];
		const { data: bpartnerMappings, error: bpartnerMapError } = await supabase
			.from('c_channel_map_bpartner')
			.select('c_bpartner_id, resource_id')
			.eq('c_channel_id', 1)
			.in('resource_id', externalBPartnerIds);

		if (bpartnerMapError) {
			console.error('Error fetching BPartner mappings:', bpartnerMapError);
			return fail(500, {
				success: false,
				message: 'Failed to fetch BPartner mappings.',
				errors: [{ step: 'prefetch_bpartners', message: bpartnerMapError.message }]
			});
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
		for (const product of erpResponse) {
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
	},
	getMarketInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		const { ids, type } = form.data;

		function stringToNumberArray(s: string): number[] {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}

		const productIds = stringToNumberArray(ids);

		// Define a more specific type for the product structure returned by the initial query
		type ProductForMarketInfo = {
			id: number;
			mpn: string | null;
			m_product_packing: { gtin: string | null }[];
			m_product_po: { c_bpartner_id: number | null; url: string | null }[];
			c_taxcategory: { c_tax: { rate: number | null }[] | null } | null;
			c_taxcategory_id: number | null;
		};

		const { data: products, error: fetchError } = await supabase
			.from('m_product')
			.select(
				'id, mpn, m_product_packing(gtin), m_product_po(c_bpartner_id, url), c_taxcategory(c_tax(rate)), c_taxcategory_id'
			)
			.not('m_product_po.url', 'is', null)
			.not('m_product_packing.gtin', 'is', null)
			.in('id', productIds);

		if (fetchError) {
			console.error('Error fetching products:', fetchError);
			return {
				success: false,
				status: 500,
				message: 'Error fetching products from database',
				error: fetchError.message
			};
		}

		if (!products || products.length === 0) {
			return { success: false, status: 404, message: 'No products found' };
		}

		const { data: allUom } = await supabase.from('c_uom').select('id,uomsymbol');
		let updatedCount = 0;
		let errorCount = 0;
		const errorMessages: string[] = [];

		const productRequests: ProductRequest[] = products.flatMap((product) =>
			product.m_product_po
				.map((po) => ({
					productId: product.id,
					href: po.url,
					barcodes: product.m_product_packing
						.map((item: { gtin: string | null }) => item.gtin)
						.filter((gtin): gtin is string => gtin !== null),
					mpn: product.mpn
				}))
				.filter((req) => req.href)
		);

		// --- Pre-fetch existing m_product_po data ---
		const { data: existingProductPoData, error: existingPoError } = await supabase
			.from('m_product_po')
			.select('m_product_id, c_bpartner_id')
			.in('m_product_id', productIds);

		if (existingPoError) {
			console.error('Error fetching existing m_product_po:', existingPoError);
			return {
				success: false,
				status: 500,
				message: 'Error fetching existing product PO data',
				error: existingPoError.message
			};
		}
		const existingPoSet = new Set(
			existingProductPoData?.map(
				(p: { m_product_id: number; c_bpartner_id: number }) =>
					`${p.m_product_id}-${p.c_bpartner_id}`
			) ?? []
		);

		const productPoUpdates: {
			where: { m_product_id: number; c_bpartner_id: number };
			data: Partial<MProductPoRow>;
		}[] = [];
		const productPoInserts: MProductPoInsert[] = [];

		try {
			const batchSize = 30;
			let allApiResults: ProductResultGet[] = [];

			for (let i = 0; i < productRequests.length; i += batchSize) {
				const batch = productRequests.slice(i, i + batchSize);
				console.log(
					`Processing batch ${i / batchSize + 1} of ${Math.ceil(productRequests.length / batchSize)}...`
				);
				try {
					const { data: batchData, error: batchError } = await scrapper
						.post('api/products', { json: { products: batch, type: type } })
						.json<ApiResponse<ProductResultGet[]>>();

					if (batchError || !batchData) {
						console.error(`Error in batch ${i / batchSize + 1}:`, batchError || 'No data received');
						errorMessages.push(
							`Error processing batch ${i / batchSize + 1}: ${batchError?.message || 'No data received'}`
						);
						errorCount += batch.length; // Assume all in batch failed
						continue; // Move to the next batch
					}
					allApiResults = allApiResults.concat(batchData);
				} catch (batchProcessError) {
					console.error(
						`Exception during processing batch ${i / batchSize + 1}:`,
						batchProcessError
					);
					errorMessages.push(
						`Exception during processing batch ${i / batchSize + 1}: ${
							(batchProcessError as Error).message
						}`
					);
					errorCount += batch.length; // Assume all in batch failed
				}
			}
			if (allApiResults.length === 0 && productRequests.length > 0) {
				console.error('No results obtained from any API batch.');
				return {
					success: false,
					status: 500,
					message: 'Failed to obtain results from API after batching.',
					details: errorMessages.length > 0 ? errorMessages : undefined
				};
			}

			for (const result of allApiResults) {
				const { product, status, productId } = result;
				const originalProduct = products.find((p: ProductForMarketInfo) => p.id === productId);

				if (!originalProduct) {
					console.error(`Original product not found for productId: ${productId}`);
					errorCount++;
					errorMessages.push(`Original product not found for productId: ${productId}`);
					continue;
				}

				if (status !== ProductStatus.OK || !product) {
					console.log(`Product ${productId} status: ${status}`);
					errorCount++;
					errorMessages.push(
						`Product ${productId} status: ${status}, data: ${JSON.stringify(product)}`
					);
					continue;
				}

				const taxRate = originalProduct.c_taxcategory_id === 2 ? 0.1 : 0.2;
				const bpartnerId = sourceId.get(product.vendorId);

				if (!bpartnerId) {
					console.error(
						`No c_bpartner_id found for vendor: ${product.vendorId} (productId: ${productId})`
					);
					errorMessages.push(
						`No c_bpartner_id found for vendor: ${product.vendorId} (productId: ${productId})`
					);
					errorCount++;
					continue;
				}

				// Update GTINs
				if (product.barcodes) {
					const allGtins = originalProduct.m_product_packing
						.map((item: { gtin: string | null }) => item.gtin)
						.filter((gtin: string | null): gtin is string => gtin !== null);
					const newBarcodes = product.barcodes.filter(
						(barcode: string) =>
							typeof barcode === 'string' && !allGtins.includes(barcode) && isValidGTIN(barcode)
					);

					if (newBarcodes.length > 0) {
						const { error: insertError } = await supabase.from('m_product_packing').insert(
							newBarcodes.map((barcode: string) => ({
								m_product_id: productId,
								packing_type: 'Individual' as Enums<'PackingType'>,
								gtin: barcode
							}))
						);

						if (insertError) {
							console.error('Error inserting new GTINs:', insertError);
							errorMessages.push(
								`Error inserting new GTINs for product ${productId}: ${insertError.message}`
							);
						} else {
							console.log(`Inserted ${newBarcodes.length} new GTINs for product ${productId}`);
						}
					}
				}

				let priceWithoutTax: number | undefined = undefined;
				if (product.vendorId !== 'idea') {
					priceWithoutTax =
						product.price || product.price === 0 ? product.price / (1 + taxRate) : undefined;
				}
				const poData: Partial<MProductPoRow> = {
					vendorproductno: product.sku ?? '', // Handle potentially null SKU
					barcode: product.barcodes?.join(', '),
					manufacturer: product.brand,
					url: product.href,
					pricelist: priceWithoutTax,
					valid_from: product.valid_from,
					valid_to: product.valid_to,
					is_active: true // Assuming active
				};

				const poKey = `${productId}-${bpartnerId}`;
				if (existingPoSet.has(poKey)) {
					productPoUpdates.push({
						where: { m_product_id: productId, c_bpartner_id: bpartnerId },
						data: poData
					});
				} else {
					productPoInserts.push({
						m_product_id: productId,
						c_bpartner_id: bpartnerId,
						...poData
					} as MProductPoInsert);
					existingPoSet.add(poKey); // Add to set to prevent duplicate inserts in this batch
				}

				// Update net quantity
				if (product.netQuantity && product.netQuantity !== 1) {
					const { error: updateProductError } = await supabase
						.from('m_product')
						.update({
							net_quantity: product.netQuantity,
							net_qty_uom_id: allUom
								? allUom.find(
										(uom: { uomsymbol?: string | null; id: number }) =>
											uom.uomsymbol?.toLowerCase() === product.netQuantityUnit?.toLowerCase()
									)?.id
								: undefined
						})
						.eq('id', productId);
					if (updateProductError) {
						console.error('Error updating product with net quantity:', updateProductError);
						errorMessages.push(
							`Error updating product ${productId} with net quantity: ${updateProductError.message}`
						);
					}
				}
				updatedCount++; // Count successful processing of a result, not db operations yet
			}

			// --- Batch Product PO Inserts ---
			if (productPoInserts.length > 0) {
				const { error: poInsertError } = await supabase
					.from('m_product_po')
					.insert(productPoInserts);
				if (poInsertError) {
					console.error('Error batch inserting product POs:', poInsertError);
					errorMessages.push(`Batch insert m_product_po failed: ${poInsertError.message}`);
					errorCount += productPoInserts.length; // Assume all failed in batch
				} else {
					console.log(
						`Successfully batch inserted ${productPoInserts.length} m_product_po records.`
					);
				}
			}
			// --- Batch Product PO Updates ---
			if (productPoUpdates.length > 0) {
				const { error: poUpdateError } = await supabase.rpc('bulk_update_product_po', {
					updates: productPoUpdates
				});
				if (poUpdateError) {
					console.error('Error calling bulk_update_product_po RPC:', poUpdateError);
					errorMessages.push(`RPC bulk_update_product_po failed: ${poUpdateError.message}`);
					errorCount += productPoUpdates.length; // Assume all failed in batch
				} else {
					console.log(
						`Successfully batch updated ${productPoUpdates.length} m_product_po records via RPC.`
					);
				}
			}

			return {
				success: true,
				status: 200,
				message: `Processed ${allApiResults.length} results from ${Math.ceil(productRequests.length / batchSize)} batches. Updated/Inserted ${updatedCount - errorCount} product POs. ${errorCount} error(s).`,
				details: errorMessages.length > 0 ? errorMessages : undefined
			};
		} catch (err) {
			if (err instanceof Error) {
				console.error('Error fetching data from API:', err);
				errorMessages.push(`Error fetching data from API: ${err.message}`);
			} else {
				console.error('Unknown error fetching data from API');
				errorMessages.push('Unknown error fetching data from API');
			}
			return {
				success: false,
				status: 500,
				message: 'Error fetching data from API',
				details: errorMessages
			};
		}
	},
	searchVendorProducts: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		const { ids } = form.data;

		function stringToNumberArray(s: string): number[] {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}

		const productIds = stringToNumberArray(ids);

		const { data: products, error: fetchError } = await supabase
			.from('m_product')
			.select('id, mpn, m_product_packing(gtin), c_taxcategory_id')
			.not('m_product_packing.gtin', 'is', null)
			.in('id', productIds);

		if (fetchError) {
			console.error('Error fetching products:', fetchError);
			return {
				success: false,
				status: 500,
				message: 'Error fetching products from database',
				error: fetchError.message
			};
		}

		if (!products || products.length === 0) {
			return { success: false, status: 404, message: 'No products found' };
		}

		try {
			const allResults: ProductsResultSearch[] = [];

			for (const product of products) {
				const gtins = product.m_product_packing
					.map((item: { gtin: string | null }) => item.gtin)
					.filter((gtin): gtin is string => gtin !== null);

				for (const gtin of gtins) {
					const barcodeSearchRequest: ProductRequest = {
						productId: product.id,
						mpn: product.mpn,
						barcodes: [gtin]
					};

					try {
						const response = await scrapper
							.post('api/search', { json: { ...barcodeSearchRequest, type: 'search' } })
							.json<ApiResponse<ProductsResultSearch[]>>();

						if (response.error) {
							console.error(`Invalid data received from API for GTIN ${gtin}:`, response.error);
							continue;
						}

						if (response.data) {
							allResults.push(...response.data);
						}
					} catch (err) {
						console.error(`Error searching for GTIN ${gtin}:`, err);
						continue;
					}
				}
			}

			if (allResults.length === 0) {
				return {
					success: false,
					status: 404,
					message: 'No results found for any barcodes'
				};
			}

			// Process and update database with results
			for (const result of allResults) {
				const originalProduct = products.find((p) => p.id === result.productId);
				if (!originalProduct) {
					console.error(`Original product not found for productId: ${result.productId}`);
					continue;
				}

				const bpartnerId = sourceId.get(result.vendorId);

				if (!bpartnerId) {
					console.error(`No bpartner ID found for vendor: ${result.vendorId}`);
					continue;
				}

				if (result.data?.href) {
					const { error: updateError, data: updatedProduct } = await supabase
						.from('m_product_po')
						.update({
							url: result.data.href
						})
						.eq('m_product_id', result.productId)
						.eq('c_bpartner_id', bpartnerId)
						.select();

					if (updateError) {
						console.error('Error updating product:', updateError);
						continue;
					}

					if (updatedProduct && updatedProduct.length === 0) {
						const { error: insertError } = await supabase.from('m_product_po').insert({
							m_product_id: result.productId,
							c_bpartner_id: bpartnerId,
							url: result.data.href,
							vendorproductno: ''
						});
						if (insertError) {
							console.error('Error inserting product:', insertError);
							continue;
						}
					}
				}
			}

			return {
				success: true,
				status: 200,
				message: `Processed ${allResults.length} results`,
				data: allResults
			};
		} catch (err) {
			if (err instanceof Error) {
				console.error('Error searching by barcode:', err);
				return {
					success: false,
					status: 500,
					message: 'Error searching by barcode',
					error: err.message
				};
			}
			return {
				success: false,
				status: 500,
				message: 'Unknown error searching by barcode'
			};
		}
	}
} satisfies Actions;
