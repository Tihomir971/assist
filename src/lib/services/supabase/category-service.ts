import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const getCategories = async (supabase: SupabaseClient<Database>) => {
	const { data: categories } = await supabase
		.from('m_product_category')
		.select('value:id,label:name')
		.order('name');

	return categories;
};
