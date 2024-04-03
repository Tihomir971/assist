import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		redirect(303, '/');
	} else {
		const { data: profile } = await supabase
			.from('ad_user')
			.select('*')
			.eq('id', session.user.id)
			.single();
		return { session, profile };
	}
};

export const actions = {
	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const fullName = formData.get('fullName') as string;
		const username = formData.get('username') as string;
		const website = formData.get('website') as string;
		const avatarUrl = formData.get('avatarUrl') as string;

		const { session } = await safeGetSession();

		if (session) {
			const { error } = await supabase.from('ad_user').upsert({
				id: id,
				auth_user_id: session?.user.id,
				full_name: fullName,
				username,
				avatar_url: avatarUrl
			});

			if (error) {
				return fail(500, {
					fullName,
					username,
					website,
					avatarUrl
				});
			}
		}
		return {
			fullName,
			username,
			website,
			avatarUrl
		};
	},
	signout: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			await supabase.auth.signOut();
			redirect(303, '/');
		}
	}
};
