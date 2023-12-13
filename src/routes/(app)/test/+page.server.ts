import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/auth');
	}

	const { data } = await supabase
		.from('m_product')
		.select()
		//.select('id,parent_id,content: name')
		.order('name');

	return { data };
}) satisfies PageServerLoad;
