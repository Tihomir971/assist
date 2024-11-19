import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { SupabaseTable } from '$lib/types/database.types';
import type { BSProduct } from '$lib/types/biznisoft';
import { getChannelMap } from '$lib/services/channel-map';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { productSelectSchema } from '$lib/types/zod';
import type { VendorProduct } from '$lib/types/product-scrapper';
import { isValidGTIN } from '$lib/scripts/gtin';
import { connector, scrapper } from '$lib/ky';

interface ProductRequest {
	productId: number;
	href?: string | null;
	barcodes?: string[];
}
enum ProductStatus {
	OK = 'ok',
	NOT_FOUND_BY_HREF = 'Not found by href',
	NOT_FOUND_BY_BARCODE = 'Not found by barcode',
	ERROR = 'error'
}
interface ProductResult {
	product: VendorProduct | null;
	status: ProductStatus;
	productId: number;
}

interface ApiResponseData<T> {
	data?: T;
	error?: string;
	status: number;
}

export const actions = {
	getErpInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(productSelectSchema));
		if (!form.valid) return fail(400, { form });
		const { data: skus } = await supabase
			.from('m_product')
			.select('sku')
			.in('id', form.data.ids.split(',').map(Number));
		if (!skus) {
			return;
		}
		const sku = skus.map(({ sku }) => parseInt(sku || '0', 10)) || [];
		const data = { sku: sku };

		const erpProduct = await connector.post('api/product', { json: data }).json<BSProduct[]>();

		const { data: mapChannel, error: mapChannelError } = await getChannelMap(supabase, 1);

		if (mapChannelError) {
			console.log('No chanell maping', mapChannel);
		}
		const { data: mapCategory } = await supabase
			.from('c_channel_map_category')
			.select('m_product_category_id,resource_id')
			.eq('c_channel_id', 1);
		const { data: mapWarehouse } = await supabase
			.from('c_channel_map_warehouse')
			.select('m_warehouse_id,resource_id')
			.eq('c_channel_id', 1);
		const { data: mapTax } = await supabase
			.from('c_channel_map_tax')
			.select('c_taxcategory_id,resource_id')
			.eq('c_channel_id', 1);

		erpProduct.forEach(async (product) => {
			// Find product ID using SKU
			const { data: selectProductId, error: selectProductIdError } = await supabase
				.from('m_product')
				.select('id')
				.eq('sku', product.sifra)
				.maybeSingle();
			if (selectProductIdError) {
				return { success: false, error: { selectProductIdError } };
			}
			if (!selectProductId) {
				return { success: false, error: { selectProductIdError: 'Product not found' } };
			}

			const uomID = Number(
				mapChannel?.find(
					(item) => item.channel_code === product.jedmere && item.entity_type === 'Uom'
				)?.internal_code
			);
			const taxID = mapTax?.find((item) => item.resource_id === product.porez)?.c_taxcategory_id;
			const { error: updateProductError } = await supabase
				.from('m_product')
				.update(
					{
						name: product.naziv,
						mpn: product.katbr ?? null,
						m_product_category_id: mapCategory?.find(
							(item) => Number(item.resource_id) === product.grupa
						)?.m_product_category_id,
						c_uom_id: uomID,
						c_taxcategory_id: taxID,
						unitsperpack: product.tpkolicina ?? 1
					},
					{ count: 'estimated' }
				)
				.eq('id', selectProductId.id);

			if (updateProductError) {
				return { success: false, error: { updateProductError } };
			}

			product.barcodes?.forEach(async (element) => {
				const { error: updateBacodesError } = await supabase
					.from('m_product_gtin')
					.insert({ m_product_id: selectProductId.id, gtin: element });
				if (updateBacodesError) {
					console.error('Error adding product GTIN:', updateBacodesError);
				}
			});
			//product.replenish?.forEach(async (replenish) => {
			//	const warehouseID = Number(
			//		mapWarehouse?.find((item) => item.resource_id === replenish.sifobj.toString())
			//			?.m_warehouse_id
			//	);
			//
			//	const { error: updateRepelnishError, count: updateRepelnishCount } = await supabase
			//		.from('m_replenish')
			//		.update(
			//			{
			//				level_min: replenish.iminzal ?? 0,
			//				level_max: replenish.imaxzal ?? 0
			//			},
			//			{ count: 'estimated' }
			//		)
			//		.eq('m_warehouse_id', warehouseID)
			//		.eq('m_product_id', selectProductId.id);
			//
			//	if (updateRepelnishError) {
			//console.log('updateRepelnishError', updateRepelnishError);

			//return { success: false, error: { updateRepelnishError } };
			//	}
			//	if (updateRepelnishCount === 0) {
			//const { error: insertRepelnishError } = await supabase.from('m_replenish').insert({
			//	m_product_id: selectProductId.id,
			//	m_warehouse_id: warehouseID,
			//	level_min: replenish.iminzal ?? 0,
			//	level_max: replenish.imaxzal ?? 0
			//});
			//if (insertRepelnishError) {
			//	console.log('insertRepelnishError', insertRepelnishError);
			//
			//	return { success: false, error: { insertRepelnishError } };
			//}
			//	}
			//});
			product.m_product_po?.forEach(async (po) => {
				const { data: erpMapBpartner, error: selectProductIdError } = await supabase
					.from('c_channel_map_bpartner')
					.select('c_bpartner_id')
					.eq('c_channel_id', 1)
					.eq('resource_id', po.kupac)
					.maybeSingle();
				if (selectProductIdError) {
					return { success: false, error: { selectProductIdError } };
				}
				if (erpMapBpartner) {
					const { data: updateProductPo, error: updateProductPoError } = await supabase
						.from('m_product_po')
						.update({
							vendorproductno: po.kupsif
						})
						.eq('m_product_id', selectProductId.id)
						.eq('c_bpartner_id', erpMapBpartner.c_bpartner_id)
						.select()
						.maybeSingle();
					if (updateProductPoError) {
						return { success: false, error: { updateProductPoError } };
					}
					if (!updateProductPo) {
						const { error: insertProductPoError } = await supabase.from('m_product_po').insert({
							c_bpartner_id: erpMapBpartner.c_bpartner_id,
							m_product_id: selectProductId.id,
							vendorproductno: po.kupsif
						});
						if (insertProductPoError) {
							return { success: false, error: { insertProductPoError } };
						}
					}
				}
			});

			product.trstanje?.forEach(async (trstanje) => {
				const warehouseID = mapWarehouse?.find(
					(item) => item.resource_id === trstanje.sifobj.toString()
				)?.m_warehouse_id;

				if (!warehouseID) return;

				const { error: updateStockError, count: updateStorageCount } = await supabase
					.from('m_storageonhand')
					.update(
						{ qtyonhand: (trstanje.stanje ?? 0) - (trstanje.neprokkasa ?? 0) },
						{ count: 'estimated' }
					)
					.eq('warehouse_id', warehouseID)
					.eq('m_product_id', selectProductId.id)
					.select();
				if (updateStockError) {
					console.log(updateStockError);
					return;
				}
				if (updateStorageCount !== 1) {
					const { error: insertStockError } = await supabase.from('m_storageonhand').insert({
						qtyonhand: (trstanje.stanje ?? 0) - (trstanje.neprokkasa ?? 0),
						warehouse_id: warehouseID,
						m_product_id: selectProductId.id
					});
					if (insertStockError) console.log('insertStockError', insertStockError);
				}
				let pricelist = 0;
				let price = 0;
				if (trstanje.sifobj === 1) {
					pricelist = 5;
					price = trstanje.nabcena;
				} else if (trstanje.sifobj === 11) {
					pricelist = 13;
					price = trstanje.mpcena;
				} else {
					return;
				}

				const { error: updatePriceError, count: countProductPriceUpd } = await supabase
					.from('m_productprice')
					.update({ pricestd: price }, { count: 'estimated' })
					.eq('m_pricelist_version_id', pricelist)
					.eq('m_product_id', selectProductId.id);
				if (updatePriceError) console.error('updatePriceError', updatePriceError);

				if (countProductPriceUpd !== 1) {
					const { error: insertPriceError } = await supabase.from('m_productprice').insert({
						pricestd: price,
						m_pricelist_version_id: pricelist,
						m_product_id: selectProductId.id
					});
					if (insertPriceError) {
						console.error('updatePriceError', updatePriceError);
					}
				}
			});
		});

		return {
			success: true
		};
	},
	deleteCategory: async ({ request, locals: { supabase } }) => {
		const id = Number((await request.formData()).get('id'));
		const { error: deleteCategoryError } = await supabase
			.from('m_product_category')
			.delete()
			.eq('id', id);
		if (deleteCategoryError) {
			throw deleteCategoryError;
		}
	},

	getCenotekaInfo: async ({ request, locals: { supabase } }) => {
		console.log('Start getCenotekaInfo');

		const form = await superValidate(request, zod(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		const { ids, source } = form.data;

		function stringToNumberArray(s: string): number[] {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}
		console.log('source', source);

		const productIds = stringToNumberArray(ids);
		const sourcePath = source === 2 ? 'scraper/cenoteka' : 'scraper/idea';

		const { data: products, error: fetchError } = await supabase
			.from('m_product')
			.select(
				'id, m_product_gtin(gtin), m_product_po(c_bpartner_id, url), c_taxcategory(c_tax(rate)),c_taxcategory_id'
			)
			.eq('m_product_po.c_bpartner_id', source)
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
		let errorMessages: string[] = [];

		const productRequests: ProductRequest[] = products.map((product) => ({
			productId: product.id,
			href: product.m_product_po.length > 0 ? product.m_product_po[0].url : null,
			barcodes: product.m_product_gtin.map((item: { gtin: string }) => item.gtin)
		}));

		try {
			const { data, status, error } = await scrapper
				.post(sourcePath, { json: { products: productRequests } })
				.json<ApiResponseData<ProductResult[]>>();
			console.log('data, status, error', data, status, error);

			if (status !== 200 || !data) {
				console.error('Invalid data received from API', error);
				return {
					success: false,
					status: 500,
					message: 'Invalid data received from API',
					error: error
				};
			}

			for (const result of data) {
				const { product, status, productId } = result;
				const originalProduct = products.find((p) => p.id === productId);

				if (!originalProduct) {
					console.error(`Original product not found for productId: ${productId}`);
					errorCount++;
					continue;
				}

				if (status !== ProductStatus.OK || !product) {
					console.log(`Product ${productId} status: ${status}`);
					errorCount++;
					continue;
				}

				const taxRate = originalProduct.c_taxcategory_id === 2 ? 0.1 : 0.2;

				// Update GTINs
				if (product.barcodes) {
					const allGtins = originalProduct.m_product_gtin.map(
						(item: { gtin: string }) => item.gtin
					);
					const newBarcodes = product.barcodes.filter(
						(barcode: string) =>
							typeof barcode === 'string' && !allGtins.includes(barcode) && isValidGTIN(barcode)
					);

					if (newBarcodes.length > 0) {
						const { error: insertError } = await supabase.from('m_product_gtin').insert(
							newBarcodes.map((barcode: string) => ({
								m_product_id: productId,
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

				const priceWithoutTax = product.price ? product.price / (1 + taxRate) : undefined;
				const { error: updateError, data: updatedProduct } = await supabase
					.from('m_product_po')
					.update({
						vendorproductno: product.sku,
						barcode: product.barcodes?.join(', '),
						manufacturer: product.brand,
						url: product.href,
						pricelist: priceWithoutTax
					})
					.eq('m_product_id', productId)
					.eq('c_bpartner_id', source)
					.select();

				if (updateError) {
					console.error('Error updating product:', updateError);
					errorMessages.push(`Error updating product ${productId}: ${updateError.message}`);
					errorCount++;
					continue;
				}

				if (updatedProduct && updatedProduct.length === 0) {
					const { error: insertError } = await supabase.from('m_product_po').insert({
						m_product_id: productId,
						c_bpartner_id: source,
						vendorproductno: product.sku,
						barcode: product.barcodes?.join(', '),
						manufacturer: product.brand,
						url: product.href,
						pricelist: priceWithoutTax
					});
					if (insertError) {
						console.error('Error inserting product:', insertError);
						errorMessages.push(`Error inserting product ${productId}: ${insertError.message}`);
						errorCount++;
						continue;
					}
				}

				// Update net quantity
				if (product.netQuantity && product.netQuantity !== 1) {
					const { error: updateProductError } = await supabase
						.from('m_product')
						.update({
							net_quantity: product.netQuantity,
							net_qty_uom_id: allUom
								? allUom.find(
										(uom) => uom.uomsymbol?.toLowerCase() === product.netQuantityUnit?.toLowerCase()
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

				updatedCount++;
			}

			return {
				success: true,
				status: 200,
				message: `Updated ${updatedCount} product(s) successfully. ${errorCount} product(s) failed to update.`,
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
	}
} satisfies Actions;
