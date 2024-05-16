import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
//import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export const getCategories = async (supabase: SupabaseClient<Database>) => {
	const { data: categories } = await supabase
		.from('m_product_category')
		.select('value:id,label:name')
		.order('name');

	return categories;
};

export const getProducts = async (
	supabase: SupabaseClient<Database>,

	categoryIds: number[] | undefined
) => {
	let query = supabase
		.from('m_product')
		.select(
			'sku,name,barcode,m_storageonhand(warehouse_id,qtyonhand),m_replenish!inner(m_warehouse_id,level_min)'
		)
		.order('name', { ascending: true })
		.eq('producttype', 'I')
		.eq('m_storageonhand.warehouse_id', 5);

	query = categoryIds
		? //typeof activeCategoryId === 'number'
			query.in('m_product_category_id', categoryIds)
		: query.is('m_product_category_id', null);

	const { data } = await query;

	return data ?? [];
};
