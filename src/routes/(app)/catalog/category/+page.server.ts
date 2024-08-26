import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './(data)/schemas.js';

/* export const load = (async () => {
	return {};
}) satisfies PageServerLoad; */

export const actions = {
	update: async ({ request, locals: { supabase } }) => {
		console.log('in the category');
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { error: createPostError } = await supabase
			.from('m_product_category')
			.update({
				name: form.data.name,
				description: form.data.description,
				parent_id: form.data.parent_id,
				isselfservice: form.data.isselfservice,
				isactive: form.data.isactive
			})
			.eq('id', form.data.id);

		if (createPostError) {
			return fail(500, { supabaseErrorMessage: createPostError.message });
		}
		return { form };
	}
} satisfies Actions;
