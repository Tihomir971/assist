import { findChildren } from '$lib/scripts/tree';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, PageServerParentData } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

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
	priceList: {
		m_pricelist_version_id: number;
		pricestd: number | null;
		pricelist: number | null;
	}[];
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
	priceMercator: number | null;
	priceMivex: number | null;
	priceCenoteka: number | null;
	priceGros: number | null;
}

interface Category {
	id: number;
	parent_id: number | null;
	title: string;
}

export const load: PageServerLoad = async ({ parent, depends, url, locals: { supabase } }) => {
	depends('catalog:test-table');

	const { searchParams } = url;
	const showProducts = searchParams.get('stock') === 'true';
	const whParam = searchParams.get('wh') || '5';
	const activeWarehouse = Number(whParam);
	const categoryIds = searchParams.get('cat');

	if (!searchParams.get('wh')) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('wh', '5');
		throw redirect(302, newUrl.toString());
	}

	const parentData = await parent();
	const categories = parentData.categories as Category[] | null;
	const warehouses = await getWarehouses(supabase);

	const query = buildQuery(supabase);
	const filteredQuery = applyFilters(query, categoryIds);
	const { data, error } = await filteredQuery;

	if (error) {
		console.error('Error fetching products:', error);
	}

	const products = filterProducts(data as unknown as Product[], showProducts, activeWarehouse);

	const flattenedProducts = products.map((product) => flattenProduct(product, activeWarehouse));

	return {
		products: flattenedProducts,
		warehouses,
		activeWarehouse,
		showProducts
	};
};

function flattenProduct(product: Product, activeWarehouse: number): FlattenedProduct {
	const purchase =
		product.priceList.find((item) => item.m_pricelist_version_id === 5)?.pricestd ?? 0;
	const retail =
		product.priceList.find((item) => item.m_pricelist_version_id === 13)?.pricestd ?? 0;
	const tax = product.c_taxcategory?.c_tax?.[0]?.rate ?? 0;

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
		qtyWholesale: product.m_storageonhand.find((item) => item.warehouse_id === 2)?.qtyonhand ?? 0,
		qtyRetail: product.m_storageonhand.find((item) => item.warehouse_id === 5)?.qtyonhand ?? 0,
		pricePurchase: purchase,
		priceRetail: retail,
		ruc: (retail / (1 + tax / 100) - purchase) / purchase,
		levelMin:
			product.level_min.find((item) => item.m_warehouse_id === activeWarehouse)?.level_min ?? null,
		levelMax:
			product.level_max.find((item) => item.m_warehouse_id === activeWarehouse)?.level_max ?? null,
		priceMercator: product.m_product_po.find((item) => item.c_bpartner_id === 4)?.pricelist ?? null,
		priceMivex: product.m_product_po.find((item) => item.c_bpartner_id === 89)?.pricelist ?? null,
		priceCenoteka: product.m_product_po.find((item) => item.c_bpartner_id === 2)?.pricelist ?? null,
		priceGros: product.m_product_po.find((item) => item.c_bpartner_id === 407)?.pricelist ?? null
	};
}

async function getWarehouses(supabase: SupabaseClient): Promise<Warehouse[]> {
	const { data } = await supabase.from('m_warehouse').select('value:id, label:name').order('name');
	return data || [];
}

function buildQuery(supabase: SupabaseClient) {
	return supabase
		.from('m_product')
		.select(
			`
            id, sku, name, barcode, mpn, unitsperpack, imageurl, discontinued,
            c_taxcategory(c_tax(rate)),
            m_storageonhand(warehouse_id,qtyonhand),
            priceList:m_productprice(m_pricelist_version_id,pricestd,pricelist),
            level_min:m_replenish(m_warehouse_id,level_min),
            level_max:m_replenish(m_warehouse_id,level_max),
            m_product_po(c_bpartner_id,pricelist)
        `
		)
		.eq('producttype', 'I')
		.eq('isactive', true)
		.order('name');
}

function applyFilters(query: ReturnType<typeof buildQuery>, categoryIds: string | null) {
	if (categoryIds) {
		return query.eq('m_product_category_id', Number(categoryIds));
	} else {
		// When no category is specified, only include products with null category
		return query.is('m_product_category_id', null);
	}
}

function filterProducts(
	data: Product[] | null,
	showProducts: boolean,
	activeWarehouse: number
): Product[] {
	if (!data) return [];

	return data.filter((product) => {
		const storage = product.m_storageonhand.find((item) => item.warehouse_id === activeWarehouse);
		const replenish = product.level_min.find((item) => item.m_warehouse_id === activeWarehouse);

		if (showProducts) {
			// Show products that are either in stock or need replenishment
			return (
				(storage && storage.qtyonhand > 0) ||
				(storage && replenish && replenish.level_min > storage.qtyonhand)
			);
		} else {
			// Show all products when showProducts is false
			return true;
		}
	});
}
