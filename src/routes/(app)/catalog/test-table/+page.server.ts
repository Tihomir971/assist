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
	c_taxcategory: { c_tax: { rate: number }[] }[];
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

interface Category {
	id: number;
	parent_id: number | null;
	title: string;
}

export const load: PageServerLoad = async ({ parent, depends, url, locals: { supabase } }) => {
	depends('catalog:test-table');

	const { searchParams } = url;
	const showReplenish = searchParams.get('rep') === 'true';
	const showStock = searchParams.get('stock') !== 'false';
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
	const filteredQuery = applyFilters(query, categories, categoryIds, showReplenish);
	const { data, error } = await filteredQuery;

	if (error) {
		console.error('Error fetching products:', error);
	}

	const products = filterProducts(
		data as unknown as Product[],
		showReplenish,
		showStock,
		activeWarehouse
	);

	return {
		products,
		warehouses,
		activeWarehouse,
		showReplenish,
		showStock
	};
};

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

function applyFilters(
	query: ReturnType<typeof buildQuery>,
	categories: Category[] | null,
	categoryIds: string | null,
	showReplenish: boolean
) {
	if (categoryIds) {
		if (categories) {
			const children = showReplenish
				? findChildren(categories, Number(categoryIds))
				: [Number(categoryIds)];
			return query.in('m_product_category_id', children);
		}
		return query.eq('m_product_category_id', Number(categoryIds));
	} else {
		// When no category is specified, only include products with null category
		return query.is('m_product_category_id', null);
	}
}

function filterProducts(
	data: Product[] | null,
	showReplenish: boolean,
	showStock: boolean,
	activeWarehouse: number
): Product[] {
	if (!data) return [];

	return data.filter((product) => {
		if (showReplenish) {
			const storage = product.m_storageonhand.find((item) => item.warehouse_id === activeWarehouse);
			const replenish = product.level_min.find((item) => item.m_warehouse_id === activeWarehouse);
			if (!(storage && replenish && replenish.level_min > storage.qtyonhand)) {
				return false;
			}
		}

		if (showStock) {
			return !product.m_storageonhand.every((item) => item.qtyonhand === 0);
		}

		return true;
	});
}
