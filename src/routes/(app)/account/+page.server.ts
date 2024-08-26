import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals: { supabase, session } }) => {
	if (!session) {
		redirect(303, '/auth');
	}
	const { data: profile } = await supabase
		.from('ad_user')
		.select('*')
		.eq('id', session.user.id)
		.single();
	return { session, profile };
};

export const actions = {
	update: async ({ request, locals: { supabase, session } }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const fullName = formData.get('fullName') as string;
		const username = formData.get('username') as string;
		const website = formData.get('website') as string;
		const avatarUrl = formData.get('avatarUrl') as string;

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
	signout: async ({ locals: { supabase, session } }) => {
		if (session) {
			await supabase.auth.signOut();
			redirect(303, '/');
		}
	}
};
