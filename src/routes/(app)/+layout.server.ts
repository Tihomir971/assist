import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ url, locals: { getSession } }) => {
	const session = await getSession();
	if (!session && url.pathname !== '/auth') {
		// the user is not signed in
		throw redirect(303, '/auth');
	}
	return {};
}) satisfies LayoutServerLoad;
