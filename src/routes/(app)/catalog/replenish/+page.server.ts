import { findChildren } from '$lib/scripts/tree';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, depends, url, locals: { supabase } }) => {
	depends('catalog:replenish');
	const { categories } = await parent();
	let query = supabase
		.from('m_product')
		.select(
			'id, sku, name, barcode, unitsperpack, c_taxcategory(c_tax(rate)), m_storageonhand!inner(warehouse_id,qtyonhand), priceList:m_productprice(m_pricelist_version_id,pricestd), level_min:m_replenish!inner(m_warehouse_id,level_min), level_max:m_replenish(m_warehouse_id,level_max)'
		)
		.gt('level_min.level_min', 0)
		.eq('m_storageonhand.warehouse_id', 5)
		.eq('producttype', 'I')
		.eq('discontinued', false)
		.order('name');

	// Filter by category
	const categoryIds = url.searchParams.get('cat');
	if (!categoryIds) {
		return { products: [] };
	}
	let children: number[] = [];
	if (categories && categoryIds) {
		children = findChildren(categories, Number(categoryIds));
	}

	if (children.length > 0) {
		query = query.in('m_product_category_id', children);
	}
	//		query = categoryIds
	//			? query.eq('m_product_category_id', Number(categoryIds))
	//			: query.is('m_product_category_id', null);

	const { data, error } = await query;
	if (error) {
		console.log('error', error);
	}

	//	console.log('data', data);
	/* 	const { data } = await supabase
		.from('m_product')
		.select(
			'id, sku, name, barcode, unitsperpack, m_storageonhand!inner(warehouse_id,qtyonhand), m_replenish!inner(m_warehouse_id,level_min)'
		)
		.gt('m_replenish.level_min', 0)
		.eq('m_storageonhand.warehouse_id', 5)
		.eq('producttype', 'I')
		.order('name'); */

	const products = data?.filter((product) => {
		// Find the storage and replenish objects for warehouse_id 5
		const storage = product.m_storageonhand.find((item) => item.warehouse_id === 5);
		const replenish = product.level_min.find((item) => item.m_warehouse_id === 5);

		// If both objects exist and level_min is greater than qtyonhand, return true
		if (storage && replenish && replenish.level_min > storage.qtyonhand) {
			return true;
		}

		// Otherwise, return false
		return false;
	});
	//	console.log('products', products);
	/* 	if (!products) {
		products = [];
	} */
	return { products: products || [] };
}) satisfies PageServerLoad;
