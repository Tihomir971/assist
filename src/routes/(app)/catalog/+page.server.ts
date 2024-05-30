//import { BIZNISOFT_API, BIZNISOFT_BEARER_TOKEN } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import * as biznisoft from '$lib/services/biznisoft.js';
import type { Actions, PageServerLoad } from './$types';
import type { Tables } from '$lib/types/database.types';
import type { BSNivoZaliha, BSProductInfo } from '$lib/types/biznisoft';
import { getChannelMap } from '$lib/services/channel-map';
//import type { BSArticle, BSNivoZaliha } from '$lib/types/biznisoft';
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

export const load = (async ({ url, depends, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) {
		redirect(303, '/auth');
	}

	depends('catalog:products');

	//Get searchParams
	const paramsOnStock = url.searchParams.get('onStock');
	//	const paramsWarehouse = url.searchParams.get('wh');
	//	if (!paramsOnStock || !paramsWarehouse) {
	if (paramsOnStock === null) {
		const newUrl = new URL(url);
		newUrl?.searchParams?.set('onStock', 'true');
		//		newUrl?.searchParams?.set('wh', paramsWarehouse ?? '5');
		redirect(303, newUrl);
	}

	/* const activeWarehouseId = Number(paramsWarehouse); */
	const onStock = paramsOnStock === 'true' ? true : false;

	/* const activeWarehouseId = url.searchParams.get('wh') ? Number(url.searchParams.get('wh')) : null; */
	const categoryIds = url.searchParams.get('cat')?.split(',').map(Number);

	const columns =
		'id,barcode,mpn,sku,name,c_taxcategory_id,c_uom_id,m_storageonhand(warehouse_id,qtyonhand),qPriceRetail:m_productprice(pricestd),qPricePurchase:m_productprice(pricestd),qPriceMarket:m_productprice(pricelist),c_taxcategory(c_tax(rate)),isactive,isselfservice,discontinued';

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
		? //typeof activeCategoryId === 'number'
			query.in('m_product_category_id', categoryIds)
		: query.is('m_product_category_id', null);

	const { data } = await query;

	const products: Product[] = [];
	data?.forEach((product) => {
		// Assign quantity  for product if exist
		let qtyonhand = 0;
		if (Array.isArray(product.m_storageonhand) && product.m_storageonhand?.length !== 0) {
			({ qtyonhand } = product.m_storageonhand[0]);
		}

		// Assign quantity  for experiment
		/* 		let experiment = undefined;
		if (Array.isArray(product.m_storageonhand) && product.m_storageonhand?.length !== 0) {
			experiment = product.m_storageonhand[0];
		} */

		if (
			(onStock === true || product.discontinued) &&
			product.m_storageonhand.every((item) => item.qtyonhand === 0)
		) {
			return;
		}

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
		/* if (priceMarket === 0) {
			priceRecommended = pricePurchase * 1.25;
		} else if (priceMarket < pricePurchase) {
			priceRecommended = pricePurchase;
		} else if (priceMarket < pricePurchase * 1.25) {
			priceRecommended = priceMarket;
		} else {
			priceRecommended = pricePurchase * 1.25;
		} */

		priceRecommended = Math.ceil(priceRecommended);
		if (priceRecommended < 1000) {
			priceRecommended = priceRecommended - 0.01;
		}

		products.push({
			id: product.id,
			barcode: product.barcode,
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

	//	const contributions = await (await fetch('/catalog')).json();
	return { products, onStock };
}) satisfies PageServerLoad;

export const actions = {
	getErpInfo: async ({ request, locals: { supabase } }) => {
		const ids = (await request.formData()).get('ids') as string;
		const { data: skus } = await supabase
			.from('m_product')
			.select('sku')
			.in('id', JSON.parse(ids || '[]'));

		const sku = skus?.map(({ sku }) => parseInt(sku || '0', 10)) || [];

		const erpStockLevels: BSNivoZaliha[] = await biznisoft.post('api/catalog/getStockLevels', sku);
		const erpProductInfo: BSProductInfo[] = await biznisoft.post('api/catalog/getProduct', sku);
		console.log('erpProductInfo', erpProductInfo);

		const { data: mapChannelSource, error: mapChannelSourceError } = await getChannelMap(
			supabase,
			1,
			'Source'
		);

		if (!mapChannelSource) {
			console.log('no source', mapChannelSourceError);
		}

		erpStockLevels.forEach(async (art) => {
			const { data: selectProductId, error: selectProductIdError } = await supabase
				.from('m_product')
				.select('id')
				.eq('sku', art.sifra)
				.maybeSingle();
			if (selectProductIdError) {
				return { success: false, error: { selectProductIdError } };
			}

			if (selectProductId?.id) {
				const warehouseID = Number(
					mapChannelSource?.find((item) => Number(item.channel_code) === art.sifobj)?.internal_code
				);
				const { error: updateRepelnishError } = await supabase
					.from('m_replenish')
					.update({ level_min: art.iminzal ?? 0, level_max: art.imaxzal ?? 0 })
					.eq('m_warehouse_id', warehouseID)
					.eq('m_product_id', selectProductId.id);

				if (updateRepelnishError) {
					return { success: false, error: { updateRepelnishError } };
				}
			}
		});
		erpProductInfo.forEach(async (art) => {
			const { data: selectProductId, error: selectProductIdError } = await supabase
				.from('m_product')
				.select('id')
				.eq('sku', art.sifra)
				.maybeSingle();
			if (selectProductIdError) {
				return { success: false, error: { selectProductIdError } };
			}

			if (selectProductId?.id) {
				const warehouseID = Number(
					mapChannelSource?.find((item) => Number(item.channel_code) === art.grupa)?.internal_code
				);
				const { error: updateRepelnishError } = await supabase
					.from('m_product')
					.update({
						name: art.naziv ?? 0,
						mpn: art.katbr ?? null,
						m_product_category_id: warehouseID
					})
					.eq('id', selectProductId.id);

				if (updateRepelnishError) {
					return { success: false, error: { updateRepelnishError } };
				}
			}
		});

		return {
			success: true
			//"data": [...]
		};
	}
} satisfies Actions;
