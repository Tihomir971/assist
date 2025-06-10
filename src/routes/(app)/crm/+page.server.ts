import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
	const { data: c_bpartner, error: dataError } = await supabase
		.from('c_bpartner')
		.select('*')
		.order('display_name');

	if (dataError) {
		error(401, 'not logged in');
	}

	return { c_bpartner: c_bpartner ?? [] };
}) satisfies PageServerLoad;
