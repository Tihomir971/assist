import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, depends }) => {
	const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/auth');
	}

	depends('catalog:categories');

	const { data: categories } = await supabase
		.from('m_product_category')
		.select('id,parent_id, content:name')
		//.select('id,parent_id,content: name')
		.order('name');

	return { categories };
}) satisfies LayoutLoad;
