import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	if (!session) {
		redirect(303, '/auth');
	}

	const { data: profile } = await supabase.from('ad_user').select();

	return { session, profile };
}) satisfies PageServerLoad;
