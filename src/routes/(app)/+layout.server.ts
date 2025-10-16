import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getWarehousesLookup } from '$lib/services/supabase/warehouse.service.remote';

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
	const [profile, warehouses] = await Promise.all([
		supabase
			.from('ad_user')
			.select('first_name, last_name, avatar_url')
			.eq('auth_user_id', session.user.id)
			.single()
			.then(({ data, error }) => {
				if (error) {
					console.error('Error loading user profile:', error);
					return null;
				}
				return data;
			}),
		getWarehousesLookup().catch((error): Array<{ value: string; label: string }> => {
			console.error('Error loading warehouses:', error);
			return [];
		})
	]);

	return {
		session,
		profile,
		app,
		warehouses
	};
};
