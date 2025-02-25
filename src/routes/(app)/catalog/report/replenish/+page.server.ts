import { findChildren } from '$lib/scripts/tree.js';

export async function load({ parent, url, locals: { supabase } }) {
	const { categories } = await parent();
	const category = url.searchParams.get('treeCategory');
	const warehouse = url.searchParams.get('warehouse');
	if (!category || !warehouse) {
		throw new Error('Category and warehouse parameters are required');
	}
	/* const subcategories = await findSubcategories(supabase, parseInt(category)); */
	const subcategories = findChildren(categories, parseInt(category));
	const { data: allProducts } = await supabase
		.from('m_product')
		.select(
			'id, sku,name, m_replenish(m_warehouse_id,level_min,level_max,qtybatchsize), m_storageonhand(warehouse_id,qtyonhand)'
		)
		.in('m_product_category_id', subcategories)
		.eq('is_active', true);

	const products = allProducts
		?.map((product) => {
			const replenish = product.m_replenish.find((r) => r.m_warehouse_id === parseInt(warehouse!));
			const retail = product.m_storageonhand.find((s) => s.warehouse_id === 5);
			const wholesale = product.m_storageonhand.find((s) => s.warehouse_id === 2);

			return {
				id: product.id,
				sku: product.sku,
				name: product.name,
				level_min: replenish?.level_min ?? 0,
				level_max: replenish?.level_max ?? 0,
				qtybatchsize: replenish?.qtybatchsize ?? 0,
				qty_wholesale: wholesale?.qtyonhand ?? 0,
				qty_retail: retail?.qtyonhand ?? 0
			};
		})
		.filter(
			(product) =>
				product.level_max - product.qty_retail >= product.qtybatchsize && product.qtybatchsize > 0
		);
	// .filter((product) => product.qty_retail < product.level_min);

	return {
		products: products || []
	};
}
