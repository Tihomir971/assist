import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { message } from 'sveltekit-superforms';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({ search_term: z.string() });

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(schema));
		if (!form.valid) return fail(400, { form });

		const { data, error } = await supabase.rpc('search_products', {
			search_term: form.data.search_term
		});
		if (error) {
			console.error('Search error:', error);
			return message(form, { message: 'Search failed' }, { status: 500 });
		}

		return { form, data, message: 'Search successfully!' };
	}
} satisfies Actions;
