import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: c_bpartner, error } = await supabase
		.from('c_bpartner')
		.select('value:id,label:display_name')
		.eq('isvendor', true)
		.order('display_name', { ascending: true });

	if (error) return { c_bpartner: [] };

	return { c_bpartner: c_bpartner ?? [] };
};
