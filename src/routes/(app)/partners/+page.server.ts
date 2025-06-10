import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
	const { data: bpartner, error } = await supabase
		.from('c_bpartner')
		.select('*')
		.order('display_name')
		.range(5, 10);
	if (error) throw error;
	return { bpartner };
}) satisfies PageServerLoad;
