import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/auth');
	}

	const { data: profile, error } = await supabase.from('ad_user').select();
	console.log('profile', profile);
	console.log('error', error);

	return { session, profile };
}) satisfies PageServerLoad;
