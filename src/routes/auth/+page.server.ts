import { redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';
import type { Actions } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
// import { loginSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';

import { z } from 'zod/v4';

const loginSchema = z.object({
	email: z.email(),
	password: z.string()
});

export const load = async () => {
	const form = await superValidate(zod4(loginSchema));

	// Always return { form } in load functions
	return { form };
};

export const actions = {
	login: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(loginSchema));

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
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					values: {
						email: form.data.email
					}
				});
			}
			return setError(form, 'email', error.message);
		}
		throw redirect(303, '/dashboard');
		// return { form };
	},

	signout: async ({ locals: { supabase, session } }) => {
		if (session) {
			await supabase.auth.signOut();
			throw redirect(303, '/');
		}
	}
} satisfies Actions;
