import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ url, locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session && url.pathname !== '/auth') {
		// the user is not signed in
		redirect(303, '/auth');
	}
	return { session };
}) satisfies LayoutServerLoad;
