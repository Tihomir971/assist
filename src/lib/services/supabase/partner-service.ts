import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const getPartners = async (supabase: SupabaseClient<Database>) => {
	const { data: partners } = await supabase
		.from('c_bpartner')
		.select('value:id,label:name')
		.eq('isvendor', true)
		.order('name');
	return partners;
};
