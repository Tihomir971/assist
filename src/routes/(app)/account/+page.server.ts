import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { crudSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, session } }) => {
	if (!session) {
		redirect(303, '/auth');
	}

	const { data: profile } = await supabase
		.from('ad_user')
		.select('id, created_at, updated_at, full_name, username, email, avatar_url')
		.eq('auth_user_id', session.user.id)
		.single();

	const form = await superValidate(profile, zod(crudSchema));
	console.log('form.data', form.data.created_at, ' ', form.data.updated_at);

	return { session, form };
};

export const actions = {
	update: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(crudSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		if (form.data.id) {
			const { error } = await supabase.from('ad_user').upsert(form.data).eq('id', form.data.id);

			if (error) {
				return fail(500, { error: error.message });
			}
		}
		return {
			form
		};
	},
	signout: async ({ locals: { supabase, session } }) => {
		if (session) {
			await supabase.auth.signOut();
			redirect(303, '/');
		}
	}
};
