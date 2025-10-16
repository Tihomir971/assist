import { getRequestEvent, command } from '$app/server';
import { z } from 'zod';
import { scrapper } from '$lib/ky';
import {
	ProductStatus,
	type ApiProductSearchResponse,
	type ProductRequest,
	type ProductResultGet,
	type ProductSearchRequest
} from '$lib/types/api/scrapper';
import type { ApiResponse } from '@tihomir971/assist-shared/api/api-response.types';
import { isValidGTIN } from '$lib/scripts/gtin';
import type { Database, MProductPoInsert, MProductPoRow } from '@tihomir971/assist-shared';
import { createSuccessResponse, createErrorResponse, createBatchResponse } from '$lib/types';

const sourceId = new Map([
	['cenoteka', 2],
	['idea', 4],
	['tehnomedia', 6]
]);

// Schema for the search by barcodes function
const searchByBarcodesSchema = z.object({
	ids: z.string()
});

// Schema for the get market info function
const getMarketInfoSchema = z.object({
	ids: z.string(),
	type: z.enum(['search', 'get']).default('get')
});

// Remote command to get market info
export const scrapperGetMarketInfo = command(getMarketInfoSchema, async ({ ids, type }) => {
	const { locals } = getRequestEvent();

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

	const { data: products, error: fetchError } = await locals.supabase
		.from('m_product')
		.select(
			'id, mpn, m_product_packing(gtin), m_product_po(c_bpartner_id, url), c_taxcategory(c_tax(rate)), c_taxcategory_id'
		)
		.not('m_product_po.url', 'is', null)
		.not('m_product_packing.gtin', 'is', null)
		.in('id', productIds);

	if (fetchError) {
		console.error('Error fetching products:', fetchError);
		return createErrorResponse(`Error fetching products from database: ${fetchError.message}`);
	}

	if (!products || products.length === 0) {
		return createErrorResponse('No products found');
	}

	const { data: allUom } = await locals.supabase.from('c_uom').select('id,uomsymbol');
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
	const { data: existingProductPoData, error: existingPoError } = await locals.supabase
		.from('m_product_po')
		.select('m_product_id, c_bpartner_id')
		.in('m_product_id', productIds);

	if (existingPoError) {
		console.error('Error fetching existing m_product_po:', existingPoError);
		return createErrorResponse(
			`Error fetching existing product PO data: ${existingPoError.message}`
		);
	}
	const existingPoSet = new Set(
		existingProductPoData?.map(
			(p: { m_product_id: number; c_bpartner_id: number }) => `${p.m_product_id}-${p.c_bpartner_id}`
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
				console.error(`Exception during processing batch ${i / batchSize + 1}:`, batchProcessError);
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
			return createBatchResponse(
				false,
				'Failed to obtain results from API after batching.',
				{
					updatedCount: 0,
					errorCount: productRequests.length,
					details: errorMessages
				},
				0,
				productRequests.length,
				errorMessages
			);
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
					const { error: insertError } = await locals.supabase.from('m_product_packing').insert(
						newBarcodes.map((barcode: string) => ({
							m_product_id: productId,
							packing_type: 'Individual' as Database['public']['Enums']['PackingType'],
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
				const { error: updateProductError } = await locals.supabase
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
			const { error: poInsertError } = await locals.supabase
				.from('m_product_po')
				.insert(productPoInserts);
			if (poInsertError) {
				console.error('Error batch inserting product POs:', poInsertError);
				errorMessages.push(`Batch insert m_product_po failed: ${poInsertError.message}`);
				errorCount += productPoInserts.length; // Assume all failed in batch
			} else {
				console.log(`Successfully batch inserted ${productPoInserts.length} m_product_po records.`);
			}
		}
		// --- Batch Product PO Updates ---
		if (productPoUpdates.length > 0) {
			const { error: poUpdateError } = await locals.supabase.rpc('bulk_update_product_po', {
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

		return createBatchResponse(
			true,
			`Processed ${allApiResults.length} results from ${Math.ceil(productRequests.length / batchSize)} batches. Updated/Inserted ${updatedCount - errorCount} product POs. ${errorCount} error(s).`,
			{
				updatedCount: updatedCount - errorCount,
				errorCount,
				details: errorMessages.length > 0 ? errorMessages : undefined
			},
			updatedCount - errorCount,
			errorCount,
			errorMessages.length > 0 ? errorMessages : undefined
		);
	} catch (err) {
		if (err instanceof Error) {
			console.error('Error fetching data from API:', err);
			return createErrorResponse(`Error fetching data from API: ${err.message}`);
		}
		return createErrorResponse('Unknown error fetching data from API');
	}
});

// Remote command to search products by barcodes
export const scrapperSearchProducts = command(searchByBarcodesSchema, async ({ ids }) => {
	const { locals } = getRequestEvent();

	function stringToNumberArray(s: string): number[] {
		const numbers = s.match(/\d+/g);
		return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
	}

	const productIds = stringToNumberArray(ids);

	const { data: products, error: fetchError } = await locals.supabase
		.from('m_product')
		.select('id, mpn, m_product_packing(gtin), c_taxcategory_id')
		.not('m_product_packing.gtin', 'is', null)
		.in('id', productIds);

	if (fetchError) {
		console.error('Error fetching products:', fetchError);
		return createErrorResponse(`Error fetching products from database: ${fetchError.message}`);
	}

	if (!products || products.length === 0) {
		return createErrorResponse('No products found');
	}

	try {
		const allResults: ApiProductSearchResponse[] = [];

		for (const product of products) {
			const gtins = product.m_product_packing
				.map((item: { gtin: string | null }) => item.gtin)
				.filter((gtin): gtin is string => gtin !== null);

			for (const gtin of gtins) {
				const barcodeSearchRequest: ProductSearchRequest = {
					productId: product.id,
					model: product.mpn,
					barcodes: [gtin]
				};

				try {
					const response = await scrapper
						.post('api/search', { json: { ...barcodeSearchRequest, type: 'search' } })
						.json<ApiResponse<ApiProductSearchResponse[]>>();

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
			return createErrorResponse('No results found for any barcodes');
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
				const { error: updateError, data: updatedProduct } = await locals.supabase
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
					const { error: insertError } = await locals.supabase.from('m_product_po').insert({
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

		return createSuccessResponse(`Processed ${allResults.length} results`, allResults);
	} catch (err) {
		if (err instanceof Error) {
			console.error('Error searching by barcode:', err);
			return createErrorResponse(`Error searching by barcode: ${err.message}`);
		}
		return createErrorResponse('Unknown error searching by barcode');
	}
});
