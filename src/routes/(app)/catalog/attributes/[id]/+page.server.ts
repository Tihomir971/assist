import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { updateAttributeWithOptionsSchema, attributeOptionSchema } from '../schema';
import type { z } from 'zod';

export const load = async ({ params, locals }: { params: { id: string }; locals: App.Locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, 'Invalid attribute ID');
	}

	// Fetch the attribute
	const { data: attribute, error: fetchError } = await locals.supabase
		.from('m_attribute')
		.select('*')
		.eq('id', id)
		.single();

	if (fetchError) {
		console.error('Error fetching attribute:', fetchError);
		throw error(500, 'Error fetching attribute');
	}

	if (!attribute) {
		throw error(404, 'Attribute not found');
	}

	// Fetch attribute options if it's a selection type
	let options: z.infer<typeof attributeOptionSchema>[] = [];
	if (attribute.attribute_type === 'single_select' || attribute.attribute_type === 'multi_select') {
		const { data: fetchedOptions, error: optionsError } = await locals.supabase
			.from('m_attribute_option')
			.select('*')
			.eq('attribute_id', id)
			.order('sort_order');

		if (optionsError) {
			console.error('Error fetching attribute options:', optionsError);
			throw error(500, 'Error fetching attribute options');
		}

		// Transform the database options to match the schema
		options = (fetchedOptions || []).map((option) => ({
			id: option.id,
			name: option.name,
			code: option.code,
			sort_order: option.sort_order ?? undefined,
			attribute_id: id
		}));
	}

	// Fetch attribute groups for the dropdown
	const { data: attributeGroups, error: groupsError } = await locals.supabase
		.from('m_attribute_group')
		.select('id, name')
		.order('name');

	if (groupsError) {
		console.error('Error fetching attribute groups:', groupsError);
		throw error(500, 'Error fetching attribute groups');
	}

	// Prepare the form with the attribute data and options
	const formData = {
		...attribute,
		description: attribute.description ?? undefined, // Convert null to undefined to match schema
		options
	};
	const form = await superValidate(formData, zod(updateAttributeWithOptionsSchema));

	return {
		form,
		attributeGroups
	};
};

export const actions = {
	update: async ({
		request,
		params,
		locals
	}: {
		request: Request;
		params: { id: string };
		locals: App.Locals;
	}) => {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			throw error(400, 'Invalid attribute ID');
		}

		const form = await superValidate(request, zod(updateAttributeWithOptionsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, code, attribute_type, attribute_group_id, description, is_active, options } =
			form.data;

		// Update the attribute
		const { error: updateError } = await locals.supabase
			.from('m_attribute')
			.update({
				name,
				code,
				attribute_type,
				attribute_group_id,
				description,
				is_active,
				updated_at: new Date().toISOString()
			})
			.eq('id', id);

		if (updateError) {
			console.error('Error updating attribute:', updateError);
			return fail(500, {
				form,
				error: 'Failed to update attribute'
			});
		}

		// If it's a selection type and has options, update them
		if (
			(attribute_type === 'single_select' || attribute_type === 'multi_select') &&
			options &&
			options.length > 0
		) {
			// First, get existing options
			const { data: existingOptions, error: fetchError } = await locals.supabase
				.from('m_attribute_option')
				.select('id')
				.eq('attribute_id', id);

			if (fetchError) {
				console.error('Error fetching existing options:', fetchError);
				return fail(500, {
					form,
					error: 'Failed to fetch existing options'
				});
			}

			// Identify options to update and options to create
			const existingIds = existingOptions?.map((o) => o.id) || [];
			const optionsToUpdate = options.filter((o) => o.id && existingIds.includes(o.id));
			const optionsToCreate = options.filter((o) => !o.id);

			// Update existing options
			for (const option of optionsToUpdate) {
				// Ensure option.id is defined before using it
				if (option.id) {
					const { error: optionUpdateError } = await locals.supabase
						.from('m_attribute_option')
						.update({
							name: option.name,
							code: option.code,
							sort_order: option.sort_order ?? null,
							updated_at: new Date().toISOString()
						})
						.eq('id', option.id);

					if (optionUpdateError) {
						console.error('Error updating option:', optionUpdateError);
						// Continue with other options
					}
				}
			}

			// Create new options
			if (optionsToCreate.length > 0) {
				const newOptions = optionsToCreate.map((option) => ({
					attribute_id: id,
					name: option.name,
					code: option.code,
					sort_order: option.sort_order ?? null,
					is_active: true,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				}));

				const { error: createError } = await locals.supabase
					.from('m_attribute_option')
					.insert(newOptions);

				if (createError) {
					console.error('Error creating new options:', createError);
					// Continue with redirect
				}
			}

			// Delete options that are no longer in the form
			const optionIdsToKeep = optionsToUpdate
				.map((o) => o.id)
				.filter((id): id is number => id !== undefined);
			const optionIdsToDelete = existingIds.filter((id) => !optionIdsToKeep.includes(id));

			if (optionIdsToDelete.length > 0) {
				const { error: deleteError } = await locals.supabase
					.from('m_attribute_option')
					.delete()
					.in('id', optionIdsToDelete);

				if (deleteError) {
					console.error('Error deleting options:', deleteError);
					// Continue with redirect
				}
			}
		}

		// Redirect to the attribute list
		throw redirect(303, '/catalog/attributes');
	}
};
