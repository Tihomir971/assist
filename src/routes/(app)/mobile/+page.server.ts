import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { message } from 'sveltekit-superforms';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({ search_term: z.string() });

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(schema));
	return { form };
};

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const searchTerm = form.data.search_term;

		const { data, error } = await supabase.rpc('search_products', {
			search_term: searchTerm
		});

		if (error) {
			console.error('Search error:', error);
			return message(form, { message: 'Search failed' }, { status: 500 });
		}

		if (!data || data.length === 0) {
			return { form, products: [], message: 'No products found' };
		}

		return { form, products: data, message: 'Search successful!' };
	}
} satisfies Actions;
