import type { Actions, PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FlattenedProduct, ProductWithDetails } from './columns.svelte.js';
import type { User } from '@supabase/supabase-js';
import type {
	Database,
	Tables,
	TablesUpdate,
	MPricelistVersionRow
} from '@tihomir971/assist-shared';
import { DateTime } from 'luxon';
import { CategoryService } from '$lib/services/supabase/category.service';

import { validateSearchParams } from 'runed/kit';
import { catalogSearchParamsSchema } from './schema.search-params';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ depends, url, locals }) => {
	depends('catalog:products');

	const {
		data: {
			report: selectedReport,
			vat: checkedVat,
			sub: showSubcategories,
			cat: categoryId,
			search: searchTerm,
			wh: activeWarehouse
		}
	} = validateSearchParams(url, catalogSearchParamsSchema);
	if (!activeWarehouse) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('wh', '5');
		throw redirect(302, newUrl.toString());
	}

	const [productsData, activePricelists] = await Promise.all([
		fetchProducts(locals.supabase, locals.user, categoryId, showSubcategories),
		getPriceLists(locals.supabase)
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
	user: User | null,
	categoryId: number | null,
	showSubcategories: boolean
) {
	let categoryIds: number[] = [];
	if (categoryId && showSubcategories) {
		const categoryService = new CategoryService(supabase);
		const categoryTreeCollection = await categoryService.getCategoryTreeCollection();
		const descendantValues = categoryTreeCollection.getDescendantValues(categoryId.toString());
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
			net_quantity,
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
			query = query.eq('m_product_category_id', categoryId);
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
				(m_replenishActiveWH.level_max - activeWarehouseStock >= m_replenishActiveWH.qtybatchsize ||
					m_replenishActiveWH.level_max === 0 ||
					m_replenishActiveWH.level_max === undefined) &&
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
	const priceVendorBest = checkedVat ? minVendorPrice * (1 + tax / 100) : minVendorPrice;
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
		price_uom: priceVendorBest / (product.net_quantity ? product.net_quantity : 1),
		// priceAgrofina: checkedVat ? agrofina * (1 + tax / 100) : agrofina,
		// priceMercator: checkedVat ? mercator * (1 + tax / 100) : mercator,
		// priceMivex: checkedVat ? mivex * (1 + tax / 100) : mivex,
		// priceCenoteka: checkedVat ? cenoteka * (1 + tax / 100) : cenoteka,
		// priceGros: checkedVat ? gros * (1 + tax / 100) : gros,
		priceMarketBest: checkedVat ? minMarketPrice * (1 + tax / 100) : minMarketPrice,
		priceVendorBest: priceVendorBest,
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
	/* getMarketInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		const { ids, type } = form.data;

		function stringToNumberArray(s: string): number[] {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}

		const productIds = stringToNumberArray(ids);

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
					existingPoSet.add(poKey);
				}

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
				updatedCount++;
			}

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
			if (productPoUpdates.length > 0) {
				const { error: poUpdateError } = await supabase.rpc('bulk_update_product_po', {
					updates: productPoUpdates
				});
				if (poUpdateError) {
					console.error('Error calling bulk_update_product_po RPC:', poUpdateError);
					errorMessages.push(`RPC bulk_update_product_po failed: ${poUpdateError.message}`);
					errorCount += productPoUpdates.length;
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
	} */
	/* searchVendorProducts: async ({ request, locals: { supabase } }) => {
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
				return {
					success: false,
					status: 404,
					message: 'No results found for any barcodes'
				};
			}

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
	} */
} satisfies Actions;
