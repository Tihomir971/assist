import { error, redirect } from '@sveltejs/kit';
import * as biznisoft from '$lib/services/biznisoft.js';
import type { Actions, PageServerLoad } from './$types';
import type { Tables } from '$lib/types/database.types';
import type { BSProduct, BSStock } from '$lib/types/biznisoft';
import { getChannelMap } from '$lib/services/channel-map';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { productSelectSchema } from '$lib/types/zod.js';
import { MARKET_INFO_API_URL } from '$env/static/private';
import type { VendorProduct } from '$lib/types/product-scrapper';
import { isValidGTIN } from '$lib/scripts/gtin';
import { connector } from '$lib/ky';

type Product = Partial<Tables<'m_product'>> & {
	id: number;
	qtyonhand: number;
	pricePurchase: number;
	priceMarket: number;
	priceRetail: number;
	priceRecommended: number;
	taxRate: number;
	m_storageonhand: { warehouse_id: number; qtyonhand: number }[];
};

export const load = (async ({ url, depends, locals: { supabase } }) => {
	depends('catalog:products');

	//Get searchParams
	const paramsOnStock = url.searchParams.get('onStock');
	//	const paramsWarehouse = url.searchParams.get('wh');
	//	if (!paramsOnStock || !paramsWarehouse) {
	if (paramsOnStock === null) {
		const newUrl = new URL(url);
		newUrl?.searchParams?.set('onStock', 'true');
		//		newUrl?.searchParams?.set('wh', paramsWarehouse ?? '5');
		redirect(302, newUrl);
	}

	/* const activeWarehouseId = Number(paramsWarehouse); */
	const onStock = paramsOnStock === 'true' ? true : false;

	/* const activeWarehouseId = url.searchParams.get('wh') ? Number(url.searchParams.get('wh')) : null; */
	const categoryIds = url.searchParams.get('cat')?.split(',').map(Number);

	const columns =
		'id, mpn, sku, name, c_uom_id, c_taxcategory_id, m_storageonhand(warehouse_id,qtyonhand),qPriceRetail:m_productprice(pricestd),qPricePurchase:m_productprice(pricestd),qPriceMarket:m_productprice(pricelist),c_taxcategory(c_tax(rate)),isactive,isselfservice,discontinued';

	let query = supabase
		.from('m_product')
		.select(columns)
		.order('name', { ascending: true })
		.eq('producttype', 'I')
		/* .eq('m_storageonhand.warehouse_id', activeWarehouseId) */
		.eq('qPriceRetail.m_pricelist_version_id', 13)
		.eq('qPricePurchase.m_pricelist_version_id', 5)
		.eq('qPriceMarket.m_pricelist_version_id', 15);
	query = categoryIds
		? query.in('m_product_category_id', categoryIds)
		: query.is('m_product_category_id', null);

	const { data } = await query;

	const products: Product[] = [];
	data?.forEach((product) => {
		// Assign quantity  for product if exist
		let qtyonhand = 0;
		if (Array.isArray(product.m_storageonhand) && product.m_storageonhand?.length !== 0) {
			({ qtyonhand } = product.m_storageonhand[0]);
		}

		if (
			(onStock === true || product.discontinued) &&
			product.m_storageonhand.every((item) => item.qtyonhand === 0)
		) {
			return;
		}

		/* const taxRate = product.c_taxcategory?.c_tax[0] === 2 ? 0.1 : 0.2; */
		const taxRate = product.c_taxcategory_id === 2 ? 0.1 : 0.2;

		// Assign retail price for product if exist
		let priceRetail = 0;
		if (Array.isArray(product.qPriceRetail) && product.qPriceRetail?.length !== 0) {
			const { pricestd } = product.qPriceRetail[0];
			priceRetail = pricestd ?? 0;
		}

		// Assign retail price for product if exist
		let priceMarket = 0;
		if (Array.isArray(product.qPriceMarket) && product.qPriceMarket?.length !== 0) {
			const { pricelist } = product.qPriceMarket[0];
			if (pricelist) {
				priceMarket = pricelist;
			}
		}

		// Assign quantity  for product if exist
		let pricePurchase = 0;
		if (Array.isArray(product.qPricePurchase) && product.qPricePurchase?.length !== 0) {
			const { pricestd } = product.qPricePurchase[0];
			pricePurchase = pricestd ? pricestd * (1 + taxRate) : 0;
		}

		let priceRecommended = 0;
		if (pricePurchase < 30) {
			priceRecommended = pricePurchase * 2;
		} else if (pricePurchase < 50) {
			priceRecommended = pricePurchase * 1.75;
		} else if (pricePurchase < 100) {
			priceRecommended = pricePurchase * 1.5;
		} else {
			priceRecommended = pricePurchase * 1.25;
		}

		priceRecommended = Math.ceil(priceRecommended);
		if (priceRecommended < 1000) {
			priceRecommended = priceRecommended - 0.01;
		}

		products.push({
			id: product.id,
			sku: product.sku,
			name: product.name,
			qtyonhand: qtyonhand,
			priceRetail: priceRetail,
			pricePurchase: pricePurchase,
			priceMarket: priceMarket,
			priceRecommended: priceRecommended,
			mpn: product.mpn,
			taxRate: taxRate,
			isactive: product.isactive,
			isselfservice: product.isselfservice,
			discontinued: product.discontinued,
			m_storageonhand: product.m_storageonhand
		});
	});

	return { products, onStock };
}) satisfies PageServerLoad;

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
				console.log('element', element);

				const { error: updateBacodesError } = await supabase
					.from('m_product_gtin')
					.insert({ m_product_id: selectProductId.id, gtin: element });
				if (updateBacodesError) {
					console.error('Error adding product GTIN:', updateBacodesError);
				}
			});
			product.replenish?.forEach(async (replenish) => {
				const warehouseID = Number(
					mapWarehouse?.find((item) => item.resource_id === replenish.sifobj.toString())
						?.m_warehouse_id
				);

				const { error: updateRepelnishError, count: updateRepelnishCount } = await supabase
					.from('m_replenish')
					.update(
						{
							level_min: replenish.iminzal ?? 0,
							level_max: replenish.imaxzal ?? 0
						},
						{ count: 'estimated' }
					)
					.eq('m_warehouse_id', warehouseID)
					.eq('m_product_id', selectProductId.id);

				if (updateRepelnishError) {
					console.log('updateRepelnishError', updateRepelnishError);

					return { success: false, error: { updateRepelnishError } };
				}
				if (updateRepelnishCount === 0) {
					const { error: insertRepelnishError } = await supabase.from('m_replenish').insert({
						m_product_id: selectProductId.id,
						m_warehouse_id: warehouseID,
						level_min: replenish.iminzal ?? 0,
						level_max: replenish.imaxzal ?? 0
					});
					if (insertRepelnishError) {
						console.log('insertRepelnishError', insertRepelnishError);

						return { success: false, error: { insertRepelnishError } };
					}
				}
			});
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
			console.log('product', product);
			product.trstanje?.forEach(async (trstanje) => {
				const warehouseID = mapWarehouse?.find(
					(item) => item.resource_id === trstanje.sifobj.toString()
				)?.m_warehouse_id;

				if (!warehouseID) return;
				console.log('warehouseID, selectProductId.id', warehouseID, selectProductId.id);

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
					console.log('stanje 1, price', trstanje, price);
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
	getIdeaInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		function stringToNumberArray(s: string) {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}

		const ids = stringToNumberArray(form.data.ids);
		console.log('ids', ids, form.data.ids);

		const { data } = await supabase
			.from('m_product')
			.select('id, m_product_po(id, c_bpartner_id, vendorproductno, url), m_product_gtin(gtin)')
			.in('id', ids);

		if (data) {
			const cookiesUrl = MARKET_INFO_API_URL + `/api/idea/cookies`;
			const cookiesResponse = await fetch(cookiesUrl);
			const { cookies } = await cookiesResponse.json();

			for (const product of data) {
				let ideaProductId: string | null = null;
				const wantedProduct = product.m_product_po.find((product) => product.c_bpartner_id === 4);

				if (wantedProduct === undefined || !wantedProduct?.url) {
					let found = false;
					for (const gtin of product.m_product_gtin) {
						console.log('Searching by gtin:', gtin);

						const scrapUrl = MARKET_INFO_API_URL + `/api/idea/extract?term=${gtin.gtin}`;
						const scrapResponse = await fetch(scrapUrl);
						const scrapData = await scrapResponse.json();
						if (!scrapData || scrapData.error) continue;

						found = true;
						ideaProductId = scrapData.productId;
						break;
					}

					if (!found) {
						console.log('Cannot find by barcode productID:', product.id);
						continue; // Move to the next product
					}
				} else {
					ideaProductId = wantedProduct.url.split('/').slice(-2)[0];
				}

				if (!ideaProductId) {
					console.log('No ideaProductId');
					continue; // Move to the next product
				}

				const fetchUrl =
					MARKET_INFO_API_URL + `/api/idea/fetch-product/${ideaProductId}?cookies=${cookies}`;
				const fetchResponse = await fetch(fetchUrl, {
					headers: { 'Content-Type': 'application/json' }
				});
				const fetchData: {
					id: number;
					code: string;
					name: string;
					manufacturer: string;
					barcodes: string[];
				} = await fetchResponse.json();

				if (fetchData) {
					const productPO = {
						c_bpartner_id: 4,
						m_product_id: product.id,
						vendorproductno: fetchData.code.replace(/^0+/, ''),
						barcode: fetchData.barcodes.join(', '),
						manufacturer: fetchData.manufacturer,
						url: 'https://online.idea.rs/#!/products/' + ideaProductId + '/'
					};

					if (wantedProduct === undefined) {
						const { error: insertProductPoError } = await supabase
							.from('m_product_po')
							.insert(productPO);
						if (insertProductPoError) {
							console.error('Error inserting product PO:', insertProductPoError);
							continue; // Move to the next product
						}
					} else {
						const { error: updateProductPoError } = await supabase
							.from('m_product_po')
							.update(productPO)
							.eq('id', wantedProduct.id);
						if (updateProductPoError) {
							console.error('Error updating product PO:', updateProductPoError);
							continue; // Move to the next product
						}
					}

					for (const element of fetchData.barcodes) {
						if (element) {
							const { error: updateBacodesError } = await supabase
								.from('m_product_gtin')
								.insert({ m_product_id: product.id, gtin: element });
							if (updateBacodesError) {
								if (updateBacodesError.code === '23505') {
									// Unique violation error code
									console.log('Product GTIN already exists, no action taken');
								} else {
									console.error('Error adding product GTIN:', updateBacodesError);
								}
							}
						}
					}
				}
			}

			// Return success after all operations are complete
			return { success: true };
		}

		// Return failure if no data was found
		return { success: false, error: 'No data found' };
	},
	getCenotekaInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		function stringToNumberArray(s: string): number[] {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}

		const ids = stringToNumberArray(form.data.ids);

		const { data: products, error: fetchError } = await supabase
			.from('m_product')
			.select(
				'id, m_product_gtin(gtin), m_product_po(c_bpartner_id, url), c_taxcategory(c_tax(rate)),c_taxcategory_id'
			)
			.eq('m_product_po.c_bpartner_id', 2)
			.in('id', ids);

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
		const fetchUrl = MARKET_INFO_API_URL + `/api/cenoteka`;
		let updatedCount = 0;
		let errorCount = 0;
		let errorMessages: string[] = [];

		for (const product of products) {
			const allGtins = product.m_product_gtin.map((item: { gtin: string }) => item.gtin);
			const taxRate = product.c_taxcategory_id === 2 ? 0.1 : 0.2;
			const poUrl = product.m_product_po.length > 0 ? product.m_product_po[0].url : null;

			let productUpdated = false;

			for (const gtin of allGtins) {
				try {
					const response = await fetch(fetchUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ barcode: gtin, href: poUrl })
					});
					if (response.status !== 200) {
						console.error(`API request failed for GTIN ${gtin}: ${response.statusText}`);
						errorMessages.push(`API request failed for GTIN ${gtin}: ${response.statusText}`);
						continue;
					}

					const { data }: { data: VendorProduct } = await response.json();
					if (!data || data === undefined) {
						console.error(`Invalid data received for GTIN ${gtin}`);
						errorMessages.push(`Invalid data received for GTIN ${gtin}`);
						continue;
					}

					if (data.barcodes) {
						const newBarcodes = data.barcodes.filter(
							(barcode: string) =>
								typeof barcode === 'string' && !allGtins.includes(barcode) && isValidGTIN(barcode)
						);

						if (newBarcodes.length > 0) {
							const { error: insertError } = await supabase.from('m_product_gtin').insert(
								newBarcodes.map((barcode: string) => ({
									m_product_id: product.id,
									gtin: barcode
								}))
							);

							if (insertError) {
								if (insertError.code === '23505') {
									console.log('Some GTINs already exist, duplicates skipped');
								} else {
									console.error('Error inserting new GTINs:', insertError);
									errorMessages.push(
										`Error inserting new GTINs for product ${product.id}: ${insertError.message}`
									);
								}
							} else {
								console.log(`Inserted ${newBarcodes.length} new GTINs for product ${product.id}`);
							}
						}
					}
					const priceWithoutTax = data.price ? data.price / (1 + taxRate) : undefined;

					const { error: updateError, data: updatedProduct } = await supabase
						.from('m_product_po')
						.update({
							vendorproductno: data.sku,
							barcode: data.barcodes?.join(', '),
							manufacturer: data.brand,
							url: data.href,
							pricelist: priceWithoutTax
						})
						.eq('m_product_id', product.id)
						.eq('c_bpartner_id', 2)
						.select();
					if (updateError) {
						console.error('Error updating product:', updateError);
						errorMessages.push(`Error updating product ${product.id}: ${updateError.message}`);
						continue;
					}
					if (updatedProduct && updatedProduct.length === 0) {
						const { error: insertError } = await supabase.from('m_product_po').insert({
							m_product_id: product.id,
							c_bpartner_id: 2,
							vendorproductno: data.sku,
							barcode: data.barcodes?.join(', '),
							manufacturer: data.brand,
							url: data.href,
							pricelist: priceWithoutTax
						});
						if (insertError) {
							console.error('Error inserting product:', insertError);
							errorMessages.push(`Error inserting product ${product.id}: ${insertError.message}`);
							continue;
						}
					}

					if (data.netQuantity && data.netQuantity !== 1) {
						const { error: updateProductError } = await supabase
							.from('m_product')
							.update({
								net_quantity: data.netQuantity,
								net_qty_uom_id: allUom
									? allUom.find(
											(uom) => uom.uomsymbol?.toLowerCase() === data.netQuantityUnit?.toLowerCase()
										)?.id
									: undefined
							})
							.eq('id', product.id);
						if (updateProductError) {
							console.error('Error updating product with net quantity:', updateProductError);
							errorMessages.push(
								`Error updating product ${product.id} with net quantity: ${updateProductError.message}`
							);
						} else {
							console.log(`Updated product ${product.id} with net quantity data`);
						}
					}

					productUpdated = true;
					updatedCount++;
					break; // Exit the loop if we get a successful response
				} catch (err) {
					if (err instanceof Error) {
						console.error(`Error fetching data for GTIN ${gtin}:`, err);
						errorMessages.push(`Error fetching data for GTIN ${gtin}: ${err.message}`);
					} else {
						console.error(`Unknown error fetching data for GTIN ${gtin}`);
						errorMessages.push(`Unknown error fetching data for GTIN ${gtin}`);
					}
				}
			}

			if (!productUpdated) {
				errorCount++;
			}
		}

		if (updatedCount > 0) {
			//error(404, {
			//	message: `Updated ${updatedCount} product(s) successfully. ${errorCount} product(s) failed to update.${errorMessages}`
			//});
			return {
				success: true,
				status: 200,
				message: `Updated ${updatedCount} product(s) successfully. ${errorCount} product(s) failed to update.`,
				details: errorMessages.length > 0 ? errorMessages : undefined
			};
		} else {
			error(404, {
				message: `Failed to update any products. ${errorCount} product(s) encountered errors.`
			});
			//return {
			//	success: false,
			//	status: 500,
			//	message: `Failed to update any products. ${errorCount} product(s) encountered errors.`,
			//	details: errorMessages
			//};
		}
	}
} satisfies Actions;
