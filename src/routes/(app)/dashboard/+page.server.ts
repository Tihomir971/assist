import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, session } }) => {
	if (!session) {
		redirect(303, '/auth');
	}

	const { data: profile } = await supabase
		.from('ad_user')
		.select('full_name')
		.eq('auth_user_id', session.user.id)
		/* .single() */
		.maybeSingle();
	const { data: categories } = await supabase
		.from('m_product_category')
		.select('id,parent_id, title:name')
		.order('name');
	return { profile: profile ?? [], categories: categories ?? [] };
};
