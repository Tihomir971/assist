import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const getWarehouses = async (supabase: SupabaseClient<Database>) => {
	const { data: warehouses } = await supabase
		.from('m_warehouse')
		.select('value:id,label:name')
		.order('name');
	return warehouses;
};
