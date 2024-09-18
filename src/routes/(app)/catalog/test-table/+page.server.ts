import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseTable } from '$lib/types/database.types';
import { DateTime } from 'luxon';

interface Warehouse {
	value: number;
	label: string;
}

interface Product {
	id: number;
	sku: string;
	name: string;
	barcode: string;
	mpn: string;
	unitsperpack: number;
	imageurl: string;
	discontinued: boolean;
	c_taxcategory?: { c_tax: { rate: number }[] } | null;
	m_storageonhand: { warehouse_id: number; qtyonhand: number }[];
	productPrice: {
		m_pricelist_version_id: number;
		pricestd: number | null;
		pricelist: number | null;
	}[];
	priceListVersion: { m_pricelist_id: number; validfrom: Date; validto: Date }[];
	level_min: { m_warehouse_id: number; level_min: number }[];
	level_max: { m_warehouse_id: number; level_max: number }[];
	m_product_po: { c_bpartner_id: number; pricelist: number | null }[];
}

export interface FlattenedProduct {
	id: number;
	sku: string;
	name: string;
	barcode: string;
	mpn: string;
	unitsperpack: number;
	imageurl: string;
	discontinued: boolean;
	taxRate: number | null;
	qtyWholesale: number;
	qtyRetail: number;
	pricePurchase: number | null;
	priceRetail: number | null;
	ruc: number;
	levelMin: number | null;
	levelMax: number | null;
	priceAgrofina: number | null;
	priceMercator: number | null;
	priceMivex: number | null;
	priceCenoteka: number | null;
	priceGros: number | null;
	action: boolean;
}

let warehousesCache: Warehouse[] | null = null;

export const load: PageServerLoad = async ({ depends, url, locals: { supabase } }) => {
	depends('catalog:test-table');

	const { searchParams } = url;
	const showStock = searchParams.get('stock') === 'true';
	const showVat = searchParams.get('showVat') === 'true';
	const whParam = searchParams.get('wh') || '5';
	const activeWarehouse = Number(whParam);
	const categoryIds = searchParams.get('cat');

	if (!searchParams.get('wh')) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('wh', '5');
		throw redirect(302, newUrl.toString());
	}

	const [warehouses, productsData, activePricelists] = await Promise.all([
		getWarehouses(supabase),
		fetchProducts(supabase, categoryIds),
		getPriceLists(supabase)
	]);

	const products = filterAndFlattenProducts(
		productsData,
		showStock,
		activeWarehouse,
		showVat,
		activePricelists
	);

	return {
		products,
		warehouses,
		activeWarehouse,
		showStock,
		showVat
	};
};

async function getWarehouses(supabase: SupabaseClient): Promise<Warehouse[]> {
	if (warehousesCache) return warehousesCache;

	const { data } = await supabase.from('m_warehouse').select('value:id, label:name').order('name');
	warehousesCache = data || [];
	return warehousesCache;
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

async function fetchProducts(supabase: SupabaseClient, categoryIds: string | null) {
	const query = supabase
		.from('m_product')
		.select(
			`
			id, sku, name, barcode, mpn, unitsperpack, imageurl, discontinued,
			c_taxcategory(c_tax(rate)),
			m_storageonhand(warehouse_id,qtyonhand),
			productPrice:m_productprice(m_pricelist_version_id,pricestd,pricelist),
			level_min:m_replenish(m_warehouse_id,level_min),
			level_max:m_replenish(m_warehouse_id,level_max),
			m_product_po(c_bpartner_id,pricelist)
		`
		)
		.eq('producttype', 'I')
		.eq('isactive', true)
		//.eq('m_pricelist_version.m_pricelist_id', 4)
		.order('name');

	if (categoryIds) {
		query.eq('m_product_category_id', Number(categoryIds));
	} else {
		query.is('m_product_category_id', null);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching products:', error);
		return [];
	}

	return data as unknown as Product[];
}

function filterAndFlattenProducts(
	products: Product[],
	showStock: boolean,
	activeWarehouse: number,
	showVat: boolean,
	activePricelists: Partial<SupabaseTable<'m_pricelist_version'>['Row']>[] | []
): FlattenedProduct[] {
	const filteredProducts = showStock
		? products.filter((product) => {
				const storage = product.m_storageonhand.find((item) => item.qtyonhand !== 0);
				const replenish = product.level_min.find((item) => item.m_warehouse_id === activeWarehouse);
				return (
					(storage && storage.qtyonhand !== 0) ||
					(storage && replenish && replenish.level_min > storage.qtyonhand)
				);
			})
		: products;

	return filteredProducts.map((product) =>
		flattenProduct(product, activeWarehouse, showVat, activePricelists)
	);
}

function flattenProduct(
	product: Product,
	activeWarehouse: number,
	showVat: boolean,
	activePricelists: Partial<SupabaseTable<'m_pricelist_version'>['Row']>[] | []
): FlattenedProduct {
	const smallestPricestd = Math.min(
		...product.productPrice
			.filter(
				(item) =>
					item.pricestd !== null &&
					activePricelists.some((pl) => pl.id === item.m_pricelist_version_id)
			)
			.map((item) => item.pricestd!)
	);
	if (product.id === 1400) {
		console.log('product', smallestPricestd);
	}
	const purchase =
		product.productPrice.find((item) => item.m_pricelist_version_id === 5)?.pricestd ?? 0;
	const retail =
		product.productPrice.find((item) => item.m_pricelist_version_id === 13)?.pricestd ?? 0;
	const tax = product.c_taxcategory?.c_tax?.[0]?.rate ?? 0;

	const storageLookup = new Map(
		product.m_storageonhand.map((item) => [item.warehouse_id, item.qtyonhand])
	);
	const levelMinLookup = new Map(
		product.level_min.map((item) => [item.m_warehouse_id, item.level_min])
	);
	const levelMaxLookup = new Map(
		product.level_max.map((item) => [item.m_warehouse_id, item.level_max])
	);
	const productPoLookup = new Map(
		product.m_product_po.map((item) => [item.c_bpartner_id, item.pricelist])
	);

	const cenoteka = productPoLookup.get(2) ?? 0;
	const agrofina = productPoLookup.get(480) ?? 0;
	const mercator = productPoLookup.get(4) ?? 0;
	const mivex = productPoLookup.get(89) ?? 0;
	const gros = productPoLookup.get(407) ?? 0;

	const priceRetail = Math.min(retail, smallestPricestd);
	const action = smallestPricestd < retail;

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
		pricePurchase: showVat ? purchase * (1 + tax / 100) : purchase,
		ruc: (priceRetail / (1 + tax / 100) - purchase) / purchase,
		priceRetail: showVat ? priceRetail : priceRetail / (1 + tax / 100),
		levelMin: levelMinLookup.get(activeWarehouse) ?? null,
		levelMax: levelMaxLookup.get(activeWarehouse) ?? null,
		priceAgrofina: showVat ? agrofina * (1 + tax / 100) : agrofina,
		priceMercator: showVat ? mercator * (1 + tax / 100) : mercator,
		priceMivex: showVat ? mivex * (1 + tax / 100) : mivex,
		priceCenoteka: showVat ? cenoteka * (1 + tax / 100) : cenoteka,
		priceGros: showVat ? gros * (1 + tax / 100) : gros,
		action
	};
}
