import type { PageServerLoad } from './$types';

export const load = (async ({ depends, locals: { supabase } }) => {
	depends('catalog:categories');

	const { data: attributes } = await supabase
		.from('m_attribute')
		.select('*,ad_org(name)')
		.order('name');

	return { attributes };
}) satisfies PageServerLoad;
