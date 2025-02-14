import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * This file is necessary to ensure protection of all routes in the `private`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/
export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		redirect(303, '/');
	}
	const { data: profile } = await supabase
		.from('ad_user')
		.select('username, full_name,  avatar_url')
		.eq('auth_user_id', session.user.id)
		.single();

	return { session, profile };
};
