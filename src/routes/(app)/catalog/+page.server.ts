import type { Actions, PageServerLoad } from './$types';
import type { Enums, Tables, Update } from '$lib/types/supabase/database.helper.js';
import type { BSProduct } from '../data/types.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FlattenedProduct, ProductWithDetails } from './columns.svelte.js';
import type { Database } from '$lib/types/supabase/database.types';
import type { ProductsResultSearch } from './types-search-vendor-products';
import type { ApiResponse } from '$lib/types/types-api';
import type { ProductRequest } from './types-api-market';

import { getChannelMap } from '$lib/services/channel-map';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { isValidGTIN } from '$lib/scripts/gtin';
import { connector, scrapper } from '$lib/ky';
import { DateTime } from 'luxon';
import { productSelectSchema } from './schema';
import { findChildren } from '$lib/scripts/tree';
import { sourceId } from './types';
import { catalogSearchParamsSchema } from './search-params.schema';
import { ProductStatus, type ProductResultGet } from './types-get-market-info';

export const load: PageServerLoad = async ({ depends, parent, url, locals: { supabase } }) => {
	depends('catalog');
	const params = catalogSearchParamsSchema.parse(Object.fromEntries(url.searchParams));
	const {
		report: selectedReport,
		vat: checkedVat,
		sub: showSubcategories,
		cat: categoryId = null
	} = params;
	const { activeWarehouse, categories } = await parent();

	const [productsData, activePricelists] = await Promise.all([
		fetchProducts(supabase, categoryId ?? null, showSubcategories, categories),
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
		products
	};
};

async function fetchProducts(
	supabase: SupabaseClient<Database>,
	categoryId: string | null,
	showSubcategories: boolean,
	categories: {
		id: number;
		parent_id: number | null;
		title: string;
	}[]
) {
	let categoryIds: number[] = [];
	if (categoryId && showSubcategories) {
		categoryIds = findChildren(categories, parseInt(categoryId));
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
					name,
					iscustomer
				)
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
	activePricelists: Partial<Tables<'m_pricelist_version'>>[] | []
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
	activePricelists: Update<'m_pricelist_version'>[]
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

	const productPoLookup = new Map(
		product.m_product_po.map((item) => [item.c_bpartner_id, item.pricelist])
	);

	const cenoteka = productPoLookup.get(2) ?? 0;
	const agrofina = productPoLookup.get(480) ?? 0;
	const mercator = productPoLookup.get(4) ?? 0;
	const mivex = productPoLookup.get(89) ?? 0;
	const gros = productPoLookup.get(407) ?? 0;

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
		name: po.c_bpartner.name,
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
		priceAgrofina: checkedVat ? agrofina * (1 + tax / 100) : agrofina,
		priceMercator: checkedVat ? mercator * (1 + tax / 100) : mercator,
		priceMivex: checkedVat ? mivex * (1 + tax / 100) : mivex,
		priceCenoteka: checkedVat ? cenoteka * (1 + tax / 100) : cenoteka,
		priceGros: checkedVat ? gros * (1 + tax / 100) : gros,
		priceMarketBest: checkedVat ? minMarketPrice * (1 + tax / 100) : minMarketPrice,
		priceVendorBest: checkedVat ? minVendorPrice * (1 + tax / 100) : minVendorPrice,
		action,
		priceMarket: priceMarket.map((pm) => ({
			...pm,
			name: pm.name ?? 'N/A',
			iscustomer: pm.iscustomer ?? false
		}))
	};
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
		// TODO: Add logging here in production to see the erpProduct response or any errors from the connector call.
		console.log('erpProduct', erpProduct);

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

		const errors: { productId?: number; step: string; message: string }[] = [];

		for (const product of erpProduct) {
			// Find product ID using SKU
			const { data: selectProductId, error: selectProductIdError } = await supabase
				.from('m_product') // TODO: Check RLS policies for m_product in production
				.select('id')
				.eq('sku', product.sifra.toString())
				.maybeSingle();
			if (selectProductIdError) {
				return { success: false, error: { selectProductIdError } };
			}
			if (!selectProductId) {
				errors.push({
					productId: undefined, // ID not found yet
					step: 'find_product_by_sku',
					message: `Product not found for SKU ${product.sifra}`
				});
				continue; // Skip to the next product
			}

			const uomID = Number(
				mapChannel?.find(
					(item) => item.channel_code === product.jedmere && item.entity_type === 'Uom'
				)?.internal_code
			);
			const taxID = mapTax?.find((item) => item.resource_id === product.porez)?.c_taxcategory_id;
			const { error: updateProductError } = await supabase
				.from('m_product') // TODO: Check RLS policies for m_product update in production
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
				errors.push({
					productId: selectProductId.id,
					step: 'update_product',
					message: updateProductError.message
				});
				// Decide if you want to continue with other updates for this product or skip
				// continue;
			}

			// Handle Barcodes
			if (product.barcodes) {
				for (const element of product.barcodes) {
					const { error: updateBarcodesError } = await supabase.from('m_product_packing').insert({
						m_product_id: selectProductId.id,
						gtin: element,
						packing_type: 'Individual' as Enums<'PackingType'>
					});
					if (updateBarcodesError) {
						// Ignore duplicate errors? Check error code if needed.
						console.error(`Error adding product GTIN ${element}:`, updateBarcodesError);
						errors.push({
							productId: selectProductId.id,
							step: 'insert_barcode',
							message: `GTIN ${element}: ${updateBarcodesError.message}`
						});
					}
				}
			}

			// Handle Product PO
			if (product.m_product_po) {
				for (const po of product.m_product_po) {
					// Added inner loop here
					const { data: erpMapBpartner, error: findBpartnerError } = await supabase
						.from('c_channel_map_bpartner')
						.select('c_bpartner_id')
						.eq('c_channel_id', 1)
						.eq('resource_id', po.kupac.toString())
						.maybeSingle();

					if (findBpartnerError) {
						errors.push({
							productId: selectProductId.id,
							step: 'find_bpartner_map',
							message: `BPartner Map for ${po.kupac}: ${findBpartnerError.message}`
						});
						continue; // Skip this PO if mapping lookup fails
					}

					if (erpMapBpartner) {
						const { data: updateProductPo, error: updateProductPoError } = await supabase
							.from('m_product_po')
							.update({
								vendorproductno: po.kupsif
							})
							.eq('m_product_id', selectProductId.id)
							.eq('c_bpartner_id', erpMapBpartner.c_bpartner_id)
							.select('m_product_id') // Select only a minimal field to check existence
							.maybeSingle();

						if (updateProductPoError) {
							errors.push({
								productId: selectProductId.id,
								step: 'update_product_po',
								message: `BPartner ${erpMapBpartner.c_bpartner_id}: ${updateProductPoError.message}`
							});
							// continue; // Optional: Skip insert if update fails
						}

						if (!updateProductPo) {
							// If update didn't find a row, insert it
							const { error: insertProductPoError } = await supabase.from('m_product_po').insert({
								c_bpartner_id: erpMapBpartner.c_bpartner_id,
								m_product_id: selectProductId.id,
								vendorproductno: po.kupsif
							});
							if (insertProductPoError) {
								errors.push({
									productId: selectProductId.id,
									step: 'insert_product_po',
									message: `BPartner ${erpMapBpartner.c_bpartner_id}: ${insertProductPoError.message}`
								});
							}
						}
					} else {
						errors.push({
							productId: selectProductId.id,
							step: 'find_bpartner_map',
							message: `BPartner mapping not found for external ID ${po.kupac}`
						});
					}
				} // End inner loop for product.m_product_po
			}

			// Handle Stock (trstanje)
			if (product.trstanje) {
				for (const trstanje of product.trstanje) {
					// Added inner loop here
					const warehouseID = mapWarehouse?.find(
						(item) => item.resource_id === trstanje.sifobj.toString()
					)?.m_warehouse_id;

					if (!warehouseID) {
						errors.push({
							productId: selectProductId.id,
							step: 'find_warehouse_map',
							message: `Warehouse mapping not found for external ID ${trstanje.sifobj}`
						});
						continue; // Skip this stock record if warehouse mapping fails
					}

					const { error: updateStockError, count: updateStorageCount } = await supabase
						.from('m_storageonhand')
						.update(
							{ qtyonhand: (trstanje.stanje ?? 0) - (trstanje.neprokkasa ?? 0) },
							{ count: 'exact' } // Use 'exact' count for reliable check
						)
						.eq('warehouse_id', warehouseID)
						.eq('m_product_id', selectProductId.id);
					// Removed .select() as count is sufficient

					if (updateStockError) {
						console.error(`Error updating stock for warehouse ${warehouseID}:`, updateStockError);
						errors.push({
							productId: selectProductId.id,
							step: 'update_stock',
							message: `Warehouse ${warehouseID}: ${updateStockError.message}`
						});
					}

					// Check count explicitly
					if (updateStorageCount === 0) {
						// If update affected 0 rows, insert
						const { error: insertStockError } = await supabase.from('m_storageonhand').insert({
							qtyonhand: (trstanje.stanje ?? 0) - (trstanje.neprokkasa ?? 0),
							warehouse_id: warehouseID,
							m_product_id: selectProductId.id
						});
						if (insertStockError) {
							console.error('insertStockError', insertStockError); // Log full error
							errors.push({
								productId: selectProductId.id,
								step: 'insert_stock',
								message: `Warehouse ${warehouseID}: ${insertStockError?.message}`
							});
						}
					} else if (updateStorageCount === null) {
						// This might happen if RLS prevents the update or count
						console.warn(
							`Update stock count returned null for product ${selectProductId.id}, warehouse ${warehouseID}. Check RLS.`
						);
						errors.push({
							productId: selectProductId.id,
							step: 'update_stock_count',
							message: `Warehouse ${warehouseID}: Update count was null (potential RLS issue).`
						});
					}

					// Handle Prices within Stock loop
					let pricelist = 0;
					let price = 0;
					if (trstanje.sifobj === 1) {
						// Assuming 1 maps to pricelist 5
						pricelist = 5;
						price = trstanje.nabcena;
					} else if (trstanje.sifobj === 11) {
						// Assuming 11 maps to pricelist 13
						pricelist = 13;
						price = trstanje.mpcena;
					} else {
						continue; // Skip price update if warehouse is not 1 or 11
					}

					const { error: updatePriceError, count: countProductPriceUpd } = await supabase
						.from('m_productprice')
						.update({ pricestd: price }, { count: 'exact' }) // Use 'exact' count
						.eq('m_pricelist_version_id', pricelist)
						.eq('m_product_id', selectProductId.id);

					if (updatePriceError) {
						console.error(`Error updating price for pricelist ${pricelist}:`, updatePriceError);
						errors.push({
							productId: selectProductId.id,
							step: 'update_price',
							message: `Pricelist ${pricelist}: ${updatePriceError.message}`
						});
					}

					if (countProductPriceUpd === 0) {
						// If update affected 0 rows, insert
						const { error: insertPriceError } = await supabase.from('m_productprice').insert({
							pricestd: price,
							m_pricelist_version_id: pricelist,
							m_product_id: selectProductId.id
						});
						if (insertPriceError) {
							console.error('insertPriceError', insertPriceError); // Log full error
							errors.push({
								productId: selectProductId.id,
								step: 'insert_price',
								message: `Pricelist ${pricelist}: ${insertPriceError.message}`
							});
						}
					} else if (countProductPriceUpd === null) {
						console.warn(
							`Update price count returned null for product ${selectProductId.id}, pricelist ${pricelist}. Check RLS.`
						);
						errors.push({
							productId: selectProductId.id,
							step: 'update_price_count',
							message: `Pricelist ${pricelist}: Update count was null (potential RLS issue).`
						});
					}
				} // End inner loop for product.trstanje
			}
		} // End of for...of loop for erpProduct

		if (errors.length > 0) {
			console.error('Errors during ERP sync:', errors);
			// Return a failure response with aggregated errors
			// Use status 422 if it's mostly data/validation issues, 500 for server/DB errors
			return fail(422, {
				success: false,
				message: `Completed with ${errors.length} errors.`,
				errors: errors
			});
		}

		// If no errors occurred
		return {
			success: true
		};
	},
	getMarketInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		const { ids, type } = form.data;

		function stringToNumberArray(s: string): number[] {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}

		const productIds = stringToNumberArray(ids);

		const { data: products, error: fetchError } = await supabase
			.from('m_product')
			.select(
				'id, mpn, m_product_packing(gtin), m_product_po(c_bpartner_id, url), c_taxcategory(c_tax(rate)), c_taxcategory_id'
			)
			//.eq('m_product_po.c_bpartner_id', source)
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

		try {
			const { data, error } = await scrapper
				.post('api/products', { json: { products: productRequests, type: type } })
				.json<ApiResponse<ProductResultGet[]>>();

			if (!data) {
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
				console.log('status, productId', status, productId);
				console.log('bool', status !== ProductStatus.OK);
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
					const allGtins = originalProduct.m_product_packing
						.map((item: { gtin: string | null }) => item.gtin)
						.filter((gtin): gtin is string => gtin !== null);
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
				// Skip price update for Idea
				if (product.vendorId !== 'idea') {
					priceWithoutTax =
						product.price || product.price === 0 ? product.price / (1 + taxRate) : undefined;
				}
				const { error: updateError, data: updatedProduct } = await supabase
					.from('m_product_po')
					.update({
						vendorproductno: product.sku,
						barcode: product.barcodes?.join(', '),
						manufacturer: product.brand,
						url: product.href,
						pricelist: priceWithoutTax,
						valid_from: product.valid_from,
						valid_to: product.valid_to
					})
					.eq('m_product_id', productId)
					.eq('c_bpartner_id', sourceId.get(product.vendorId) ?? 0)
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
						c_bpartner_id: sourceId.get(product.vendorId) ?? 0,
						vendorproductno: product.sku,
						barcode: product.barcodes?.join(', '),
						manufacturer: product.brand,
						url: product.href,
						pricelist: priceWithoutTax,
						valid_from: product.valid_from,
						valid_to: product.valid_to
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
	},
	searchVendorProducts: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(productSelectSchema));
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
