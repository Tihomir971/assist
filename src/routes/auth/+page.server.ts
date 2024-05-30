import { fail, redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions = {
	signin: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const {
			locals: { supabase }
		} = event;
		//		const formData = await request.formData();

		//		const email = formData.get('email') as string;
		//		const password = formData.get('password') as string;
		console.log('email,password', form.data.email, form.data.password);
		const { error } = await supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		});

		if (error) {
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

		redirect(303, '/dashboard');
	},

	signout: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (session) {
			await supabase.auth.signOut();
			throw redirect(303, '/');
		}
	}
} satisfies Actions;
