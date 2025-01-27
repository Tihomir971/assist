import type { Actions, PageServerLoad } from './$types';
import type { SupabaseTable } from '$lib/types/supabase.types';
import type { BSProduct } from '../data/types';
import { getChannelMap } from '$lib/services/channel-map';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { VendorProduct } from '$lib/types/product-scrapper';
import { isValidGTIN } from '$lib/scripts/gtin';
import { connector, scrapper } from '$lib/ky';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import type { FlattenedProduct, Product } from './columns.svelte.js';
import { productSelectSchema } from './schema';
import { findChildren } from '$lib/scripts/tree';
import { sourceId } from './types';
import { catalogSearchParamsSchema } from './search-params.schema';
import type {
	BarcodeSearchRequest,
	BarcodeSearchResponse,
	BarcodeSearchVendorResult
} from './marketApiTypes';

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
}

export const load: PageServerLoad = async ({ depends, parent, url, locals: { supabase } }) => {
	depends('catalog');
	const params = catalogSearchParamsSchema.parse(Object.fromEntries(url.searchParams));
	const {
		stock: checkedStock,
		report: checkedReport,
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
		checkedStock,
		checkedReport ?? null,
		activeWarehouse,
		checkedVat,
		activePricelists
	);

	return {
		products
	};
};

async function fetchProducts(
	supabase: SupabaseClient,
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
	const query = supabase
		.from('m_product')
		.select(
			'id, sku, name, barcode, mpn, unitsperpack, imageurl, discontinued,c_taxcategory(c_tax(rate)),m_storageonhand(warehouse_id,qtyonhand),productPrice:m_productprice(m_pricelist_version_id,pricestd,pricelist),m_replenish(m_warehouse_id,level_min,level_max,qtybatchsize,m_warehousesource_id),m_product_po(c_bpartner_id, pricelist, c_bpartner(name, iscustomer)),isactive'
		)
		.eq('producttype', 'I')
		.order('name');

	if (categoryIds.length > 0) {
		query.in('m_product_category_id', categoryIds);
	} else {
		if (categoryId) {
			query.eq('m_product_category_id', parseInt(categoryId));
		} else {
			query.is('m_product_category_id', null);
		}
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching products:', error);
		return [];
	}

	return (data as unknown as Product[]).filter((product) => {
		const hasStock = product.m_storageonhand.some((item) => item.qtyonhand > 0);
		return product.isactive || hasStock;
	});
}

async function getPriceLists(
	supabase: SupabaseClient
): Promise<Partial<SupabaseTable<'m_pricelist_version'>['Row']>[] | []> {
	const nowBelgrade = DateTime.now().setZone('Europe/Belgrade');
	const targetDate = nowBelgrade.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ");

	const { data } = await supabase
		.from('m_pricelist_version')
		.select('id')
		.eq('isactive', true)
		.eq('m_pricelist_id', 4)
		.or(`validfrom.lte.${targetDate},validfrom.is.null`)
		.or(`validto.gte.${targetDate},validto.is.null`);

	return data || [];
}

function filterAndFlattenProducts(
	products: Product[],
	checkedStock: boolean,
	checkedReport: string | null,
	activeWarehouse: number,
	checkedVat: boolean,
	activePricelists: Partial<SupabaseTable<'m_pricelist_version'>['Row']>[] | []
): FlattenedProduct[] {
	let filteredProducts: Product[];
	if (checkedReport === 'replenish') {
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
			if (product.id === 185) {
				console.log('m_replenishActiveWH', m_replenishActiveWH);
				console.log('activeWarehouseStock', activeWarehouseStock);
				console.log('sourceWarehouseStock', sourceWarehouseStock);
			}

			// const activeWarehouseLevelMin =
			// 	product.m_replenish.find((item) => item.m_warehouse_id === activeWarehouse)?.level_min || 0;

			return (
				m_replenishActiveWH &&
				m_replenishActiveWH.level_max - activeWarehouseStock >= m_replenishActiveWH.qtybatchsize &&
				m_replenishActiveWH.qtybatchsize > 0 &&
				m_replenishActiveWH.level_min > 0 &&
				sourceWarehouseStock > 0
			);
		});
	} else if (checkedStock) {
		filteredProducts = products.filter((product) => {
			const hasNonZeroStock = product.m_storageonhand.some((item) => item.qtyonhand !== 0);
			const activeWarehouseStock =
				product.m_storageonhand.find((item) => item.warehouse_id === activeWarehouse)?.qtyonhand ||
				0;
			const activeWarehouseLevelMin = product.m_replenish.find(
				(item) => item.m_warehouse_id === activeWarehouse
			)?.level_min;

			return (
				hasNonZeroStock ||
				(activeWarehouseLevelMin !== undefined && activeWarehouseLevelMin > activeWarehouseStock)
			);
		});
	} else {
		filteredProducts = products;
	}

	return filteredProducts.map((product) =>
		flattenProduct(product, activeWarehouse, checkedVat, activePricelists)
	);
}

function flattenProduct(
	product: Product,
	activeWarehouse: number,
	checkedVat: boolean,
	activePricelists: Partial<SupabaseTable<'m_pricelist_version'>['Row']>[] | []
): FlattenedProduct {
	if (product.id === 185) {
		console.log('product', product);
	}
	const smallestPricestd = Math.min(
		...product.productPrice
			.filter(
				(item) =>
					item.pricestd !== null &&
					activePricelists.some((pl) => pl.id === item.m_pricelist_version_id)
			)
			.map((item) => item.pricestd!)
	);

	const purchase =
		product.productPrice.find((item) => item.m_pricelist_version_id === 5)?.pricestd ?? 0;
	const retail =
		product.productPrice.find((item) => item.m_pricelist_version_id === 13)?.pricestd ?? 0;
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
		barcode: product.barcode,
		mpn: product.mpn,
		unitsperpack: product.unitsperpack,
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
		priceMarket
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
				.eq('sku', product.sifra.toString())
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

			product.m_product_po?.forEach(async (po) => {
				const { data: erpMapBpartner, error: selectProductIdError } = await supabase
					.from('c_channel_map_bpartner')
					.select('c_bpartner_id')
					.eq('c_channel_id', 1)
					.eq('resource_id', po.kupac.toString())
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

	getMarketInfo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(productSelectSchema));
		if (!form.valid) return fail(400, { form });

		const { ids, source } = form.data;

		function stringToNumberArray(s: string): number[] {
			const numbers = s.match(/\d+/g);
			return numbers ? numbers.map((num) => parseInt(num, 10)) : [];
		}

		const productIds = stringToNumberArray(ids);
		//const sourceIds = stringToNumberArray(source);
		// const path = sourcePath[source as keyof typeof sourcePath];

		const { data: products, error: fetchError } = await supabase
			.from('m_product')
			.select(
				'id, m_product_gtin(gtin), m_product_po(c_bpartner_id, url), c_taxcategory(c_tax(rate)),c_taxcategory_id'
			)
			//.eq('m_product_po.c_bpartner_id', source)
			.not('m_product_po.url', 'is', null)
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
					barcodes: product.m_product_gtin.map((item: { gtin: string }) => item.gtin)
				}))
				.filter((req) => req.href)
		);

		try {
			const { data, error } = await scrapper
				.post('scraper', { json: { products: productRequests } })
				.json<ApiResponseData<ProductResult[]>>();

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

				let priceWithoutTax: number | undefined = undefined;
				// Skip price update for Idea
				if (source !== 4) {
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
	searchByBarcode: async ({ request, locals: { supabase } }) => {
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
			.select('id, m_product_gtin(gtin), c_taxcategory_id')
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
			const allResults: BarcodeSearchVendorResult[] = [];

			for (const product of products) {
				const gtins = product.m_product_gtin.map((item: { gtin: string }) => item.gtin);

				for (const gtin of gtins) {
					const barcodeSearchRequest: BarcodeSearchRequest = {
						productId: product.id,
						barcodes: [gtin]
					};

					try {
						const response = await scrapper
							.post('scraper/search/barcode', { json: { ...barcodeSearchRequest } })
							.json<BarcodeSearchResponse>();

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
