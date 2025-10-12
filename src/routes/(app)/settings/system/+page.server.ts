import { fail, redirect, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms/server';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import { adUserUpdateSchema } from '$lib/types/supabase.zod.schemas';

// Define the session user type
type SessionUser = {
	id: string;
	// Add other properties as needed
};
const adUserSchema = adUserUpdateSchema
	.extend({
		password: z.string().min(6).optional(),
		confirm_password: z.string().min(6).optional()
	})
	.refine(
		(data) => {
			if (data.password || data.confirm_password) {
				return data.password === data.confirm_password;
			}
			return true;
		},
		{
			message: "Passwords don't match",
			path: ['confirm_password']
		}
	);
const authUsersSchema = z
	.object({
		email: z.email().nullable(),
		last_name: z.string().min(1).nullable(),
		first_name: z.string().min(3).nullable(),
		password: z.string().min(6).optional(),
		confirm_password: z.string().min(6).optional()
	})
	.refine(
		(data) => {
			if (data.password || data.confirm_password) {
				return data.password === data.confirm_password;
			}
			return true;
		},
		{
			message: "Passwords don't match",
			path: ['confirm_password']
		}
	);

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const session = await safeGetSession();
	if (!session || !session.user) {
		throw redirect(302, '/auth');
	}

	const user = session.user;

	const { data: adUser, error: fetchError } = await supabase
		.from('ad_user')
		.select('id, email, first_name, last_name')
		.eq('auth_user_id', user.id)
		.single();

	if (fetchError) {
		console.error('Error fetching user data:', fetchError);
		throw error(500, 'Error fetching user data');
	}

	return { form: await superValidate(adUser, zod4(adUserSchema)) };
};

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session || !session.user) {
			throw redirect(302, '/auth');
		}

		const user = session.user as SessionUser;

		const form = await superValidate(request, zod4(authUsersSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { password, confirm_password, ...updateData } = form.data;
		if (password !== confirm_password) {
			return fail(400, { form });
		}

		try {
			const { error: updateError } = await locals.supabase
				.from('ad_user')
				.update(updateData)
				.eq('auth_user_id', user.id);

			if (updateError) throw updateError;

			if (password) {
				const { error: passwordError } = await locals.supabase.auth.updateUser({
					password: password
				});

				if (passwordError) throw passwordError;
			}

			return message(form, 'User data updated successfully');
		} catch (error) {
			console.error('Error updating user data:', error);
			return message(form, 'Error updating user data', { status: 500 });
		}
	}
} satisfies Actions;
