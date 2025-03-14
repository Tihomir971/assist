import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { packingInsertSchema } from './schema';
import { message } from 'sveltekit-superforms';

export const load = (async ({ locals: { supabase } }) => {
	// Fetch all packing types for the select

	// Fetch all packing records with their types
	const { data: packings } = await supabase
		.from('m_product_packing')
		.select('id, m_product_id, packing_type, unitsperpack, gtin, is_display')
		.eq('m_product_id', 6109);

	// Initialize form for create/edit operations
	const form = await superValidate(zod(packingInsertSchema));

	return { packings, form };
}) satisfies PageServerLoad;

export const actions = {
	upsert: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(packingInsertSchema));
		if (!form.valid) return fail(400, { form });

		if (!form.data.id) {
			// CREATE Barcode
			const { error } = await supabase.from('m_product_packing').insert({ ...form.data });
			console.log('error', error);

			if (error) {
				return fail(500, {
					form,
					message: error.message
				});
			}

			return message(form, 'Barcode created!');
		} else {
			// UPDATE Barcode
			const { error } = await supabase
				.from('m_product_packing')
				.update({ ...form.data })
				.eq('id', form.data.id as number);

			if (error) {
				console.log('error', error);

				return fail(500, {
					form,
					message: error.message
				});
			}
		}

		return message(form, 'Barcode updated!');
	},

	delete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(packingInsertSchema));
		if (!form.valid) {
			return message(form, 'Invalid ID for constellation.');
		}

		if (!form.id) return message(form, 'Invalid ID for barcode.');

		// const { error } = await supabase.from('m_product_packing').delete().eq('id', parseInt(id));
		const { error } = await supabase.from('m_product_packing').delete().eq('id', parseInt(form.id));

		if (error) {
			return fail(500, {
				message: error.message
			});
		}

		return message(form, 'Deleted.');
	}
} satisfies Actions;
