import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { createAttributeWithOptionsSchema } from '../schema';

export const load = async ({ locals }: { locals: App.Locals }) => {
	// Fetch attribute groups for the dropdown
	const { data: attributeGroups, error: groupsError } = await locals.supabase
		.from('m_attribute_group')
		.select('id, name')
		.order('name');

	if (groupsError) {
		console.error('Error fetching attribute groups:', groupsError);
		throw error(500, 'Error fetching attribute groups');
	}

	// Prepare the form
	const form = await superValidate(zod(createAttributeWithOptionsSchema));

	return {
		form,
		attributeGroups
	};
};

export const actions = {
	create: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const form = await superValidate(request, zod(createAttributeWithOptionsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, code, attribute_type, attribute_group_id, description, options } = form.data;

		// Start a transaction
		const { data: attribute, error: insertError } = await locals.supabase
			.from('m_attribute')
			.insert({
				name,
				code,
				attribute_type,
				attribute_group_id,
				description,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				is_active: true
			})
			.select()
			.single();

		if (insertError) {
			console.error('Error creating attribute:', insertError);
			return fail(500, {
				form,
				error: 'Failed to create attribute'
			});
		}

		// If it's a selection type and has options, insert them
		if (
			(attribute_type === 'single_select' || attribute_type === 'multi_select') &&
			options &&
			options.length > 0
		) {
			const optionsToInsert = options.map((option, index) => ({
				attribute_id: attribute.id,
				name: option.name,
				code: option.code,
				sort_order: option.sort_order || index,
				is_active: true,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}));

			const { error: optionsError } = await locals.supabase
				.from('m_attribute_option')
				.insert(optionsToInsert);

			if (optionsError) {
				console.error('Error creating attribute options:', optionsError);
				// We don't fail here since the attribute was created successfully
				// But we should log the error
			}
		}

		// Redirect to the attribute list
		throw redirect(303, '/catalog/attributes');
	}
};
