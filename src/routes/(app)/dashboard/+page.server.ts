//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
	//	const { session } = await safeGetSession();

	//	if (!session) {
	//		redirect(303, '/auth');
	//	}

	const { data: profile } = await supabase.from('ad_user').select();

	return { profile: profile ?? [] };
}) satisfies PageServerLoad;
