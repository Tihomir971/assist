import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { mAttributeGroupUpdateSchema } from '$lib/types/supabase.zod.schemas';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals }: { params: { id: string }; locals: App.Locals }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid attribute group ID');
	}

	// Fetch the attribute group
	const { data: attributeGroup, error: fetchError } = await locals.supabase
		.from('m_attribute_group')
		.select('*')
		.eq('id', id)
		.single();

	if (fetchError || !attributeGroup) {
		throw error(404, 'Attribute group not found');
	}

	// Initialize the form with existing data using the Supabase Zod schema
	const form = await superValidate(attributeGroup, zod(mAttributeGroupUpdateSchema));

	return {
		attributeGroup,
		form
	};
};

export const actions = {
	update: async ({
		request,
		locals,
		params
	}: {
		request: Request;
		locals: App.Locals;
		params: { id: string };
	}) => {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			throw error(400, 'Invalid attribute group ID');
		}

		// Validate form using Supabase Zod schema
		const form = await superValidate(request, zod(mAttributeGroupUpdateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, is_active } = form.data;

		const { error: updateError } = await locals.supabase
			.from('m_attribute_group')
			.update({
				name,
				is_active
			})
			.eq('id', id);

		if (updateError) {
			console.error('Error updating attribute group:', updateError);
			return fail(500, {
				form,
				error: 'Failed to update attribute group'
			});
		}

		return { form, success: true };
	}
};
