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

	return { profile: profile ?? [] };
};
