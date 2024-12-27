import { fail, redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { loginSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(loginSchema));

	return { form };
};

export const actions = {
	login: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(loginSchema));
		console.log('form', form);

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { error } = await supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		});

		if (error) {
			console.log('error', error);

			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					values: {
						email: form.data.email
					}
				});
			}
			return fail(500, {
				error: 'Server error. Try again later.',
				values: {
					email: form.data.email
				}
			});
		}
		throw redirect(303, '/dashboard');
		// return { form };
	},

	signout: async ({ locals: { supabase, session } }) => {
		console.log('signout');
		if (session) {
			await supabase.auth.signOut();
			throw redirect(303, '/');
		}
	}
} satisfies Actions;
