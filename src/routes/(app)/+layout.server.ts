import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
/**
 * This file is necessary to ensure protection of all routes in the `private`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/
export const load: LayoutServerLoad = async ({
	locals: { supabase, safeGetSession, app },
	depends
}) => {
	// Keep depends for user preferences; category tree will be loaded client-side via in-memory cache
	depends('user:preferences');

	const { session } = await safeGetSession();

	if (!session) {
		redirect(303, '/auth');
	}
	// Load profile, locales and user preferences in parallel; category tree removed from server load
	const [profile] = await Promise.all([
		supabase
			.from('ad_user')
			.select('first_name, last_name, avatar_url')
			.eq('auth_user_id', session.user.id)
			.single()
			.then(({ data }) => data)
	]);

	return {
		session,
		profile,
		app
	};
};
