import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { packingSchema } from './schema';

export const load = (async ({ locals: { supabase } }) => {
	// Fetch all packing types for the select
	const { data: packingTypes } = await supabase.from('m_product_packing_type').select('*');

	// Fetch all packing records with their types
	const { data: packings } = await supabase
		.from('m_product_packing')
		.select('*')
		.eq('m_product_id', 6109);

	// Initialize form for create/edit operations
	const form = await superValidate(zod(packingSchema));

	return { packings, packingTypes, form };
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(packingSchema));
		if (!form.valid) return fail(400, { form });

		const { error } = await supabase.from('m_product_packing').insert({
			m_product_id: form.data.m_product_id,
			m_product_packing_type_id: form.data.m_product_packing_type_id,
			unitsperpack: form.data.unitsperpack,
			gtin: form.data.gtin
		});

		if (error) {
			console.log('error', error);

			return fail(500, {
				form,
				message: error.message
			});
		}

		return { form };
	},

	update: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(packingSchema));
		if (!form.valid) return fail(400, { form });

		const { error } = await supabase
			.from('m_product_packing')
			.update({
				m_product_id: form.data.m_product_id,
				m_product_packing_type_id: form.data.m_product_packing_type_id,
				unitsperpack: form.data.unitsperpack,
				gtin: form.data.gtin
			})
			.eq('id', form.data.id as number);

		if (error) {
			return fail(500, {
				form,
				message: error.message
			});
		}

		return { form };
	},

	delete: async ({ url, locals: { supabase } }) => {
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Missing ID' });

		const { error } = await supabase.from('m_product_packing').delete().eq('id', parseInt(id));

		if (error) {
			return fail(500, {
				message: error.message
			});
		}

		return { success: true };
	}
} satisfies Actions;
