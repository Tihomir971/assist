import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ depends, locals: { supabase, getSession } }) => {
	depends('catalog:categories');
	const session = await getSession();
	if (!session) {
		redirect(303, '/auth');
	}

	const { data: attributes } = await supabase
		.from('m_attribute')
		.select('*,ad_org(name)')
		.order('name');

	return { attributes };
}) satisfies PageServerLoad;
