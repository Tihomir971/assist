import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { CategoryService } from '$lib/services/supabase/category.service';

/**
 * This file is necessary to ensure protection of all routes in the `private`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/
export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, depends }) => {
	depends('catalog:categories');

	const { session } = await safeGetSession();

	if (!session) {
		redirect(303, '/');
	}

	const categoryService = new CategoryService(supabase);

	const [profile, categoryTree] = await Promise.all([
		supabase
			.from('ad_user')
			.select('first_name, last_name, avatar_url')
			.eq('auth_user_id', session.user.id)
			.single()
			.then(({ data }) => data),
		categoryService.getCategoryTree()
	]);

	return {
		session,
		profile,
		categoryTree
	};
};
