import { redirect, type Actions } from '@sveltejs/kit';

export const actions = {
	signout: async ({ locals: { supabase, safeGetSession } }) => {
		console.log('signout2');

		const { session } = await safeGetSession();
		if (session) {
			console.log('supabase.auth.signOut();');
			await supabase.auth.signOut();
			redirect(303, '/');
		}
	}
} satisfies Actions;
