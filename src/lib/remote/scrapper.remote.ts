import { getRequestEvent, command } from '$app/server';
import { z } from 'zod';
import { scrapper } from '$lib/ky';
import type { ApiProductSearchResponse, ProductSearchRequest } from '$lib/types/api/scrapper';
import type { ApiResponse } from '@tihomir971/assist-shared/api/api-response.types';

const sourceId = new Map([
	['cenoteka', 2],
	['idea', 4],
	['tehnomedia', 6]
]);

// Schema for the search by barcodes function
const searchByBarcodesSchema = z.object({
	ids: z.string()
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
		throw new Error(`Error fetching products from database: ${fetchError.message}`);
	}

	if (!products || products.length === 0) {
		throw new Error('No products found');
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
			throw new Error('No results found for any barcodes');
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

		return {
			success: true,
			message: `Processed ${allResults.length} results`,
			data: allResults
		};
	} catch (err) {
		if (err instanceof Error) {
			console.error('Error searching by barcode:', err);
			throw new Error(`Error searching by barcode: ${err.message}`);
		}
		throw new Error('Unknown error searching by barcode');
	}
});
