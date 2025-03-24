import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { updateAttributeSetWithAttributesSchema, attributeSetAttributeSchema } from '../schema';
import type { z } from 'zod';

export const load = async ({ params, locals }: { params: { id: string }; locals: App.Locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, 'Invalid attribute set ID');
	}

	// Fetch the attribute set
	const { data: attributeSet, error: fetchError } = await locals.supabase
		.from('m_attributeset')
		.select('*')
		.eq('id', id)
		.single();

	if (fetchError) {
		console.error('Error fetching attribute set:', fetchError);
		throw error(500, 'Error fetching attribute set');
	}

	if (!attributeSet) {
		throw error(404, 'Attribute set not found');
	}

	// Fetch attribute set attributes
	const { data: attributeSetAttributes, error: attributesError } = await locals.supabase
		.from('m_attributeset_attribute')
		.select('*, m_attribute(*)')
		.eq('attributeset_id', id)
		.order('sequence');

	if (attributesError) {
		console.error('Error fetching attribute set attributes:', attributesError);
		throw error(500, 'Error fetching attribute set attributes');
	}

	// Fetch all available attributes for the dropdown
	const { data: allAttributes, error: allAttributesError } = await locals.supabase
		.from('m_attribute')
		.select('id, name, attribute_type')
		.order('name');

	if (allAttributesError) {
		console.error('Error fetching attributes:', allAttributesError);
		throw error(500, 'Error fetching attributes');
	}

	// Transform the database attributes to match the schema
	const attributes: z.infer<typeof attributeSetAttributeSchema>[] = (
		attributeSetAttributes || []
	).map((attr) => ({
		id: attr.id,
		attributeset_id: id,
		attribute_id: attr.attribute_id,
		sequence: attr.sequence ?? undefined,
		is_required: attr.is_required ?? false,
		is_active: attr.is_active ?? true
	}));

	// Prepare the form with the attribute set data and attributes
	const formData = {
		...attributeSet,
		description: attributeSet.description ?? undefined, // Convert null to undefined to match schema
		attributes
	};
	const form = await superValidate(formData, zod(updateAttributeSetWithAttributesSchema));

	return {
		form,
		allAttributes,
		attributeSetAttributes
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
			throw error(400, 'Invalid attribute set ID');
		}

		const form = await superValidate(request, zod(updateAttributeSetWithAttributesSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, code, description, is_active, attributes } = form.data;

		// Update the attribute set
		const { error: updateError } = await locals.supabase
			.from('m_attributeset')
			.update({
				name,
				code,
				description,
				is_active,
				updated_at: new Date().toISOString()
			})
			.eq('id', id);

		if (updateError) {
			console.error('Error updating attribute set:', updateError);
			return fail(500, {
				form,
				error: 'Failed to update attribute set'
			});
		}

		// If it has attributes, update them
		if (attributes && attributes.length > 0) {
			// First, get existing attributes
			const { data: existingAttributes, error: fetchError } = await locals.supabase
				.from('m_attributeset_attribute')
				.select('id')
				.eq('attributeset_id', id);

			if (fetchError) {
				console.error('Error fetching existing attributes:', fetchError);
				return fail(500, {
					form,
					error: 'Failed to fetch existing attributes'
				});
			}

			// Identify attributes to update and attributes to create
			const existingIds = existingAttributes?.map((a) => a.id) || [];
			const attributesToUpdate = attributes.filter((a) => a.id && existingIds.includes(a.id));
			const attributesToCreate = attributes.filter((a) => !a.id);

			// Update existing attributes
			for (const attribute of attributesToUpdate) {
				// Ensure attribute.id is defined before using it
				if (attribute.id) {
					const { error: attributeUpdateError } = await locals.supabase
						.from('m_attributeset_attribute')
						.update({
							attribute_id: attribute.attribute_id,
							sequence: attribute.sequence ?? null,
							is_required: attribute.is_required,
							is_active: attribute.is_active,
							updated_at: new Date().toISOString()
						})
						.eq('id', attribute.id);

					if (attributeUpdateError) {
						console.error('Error updating attribute:', attributeUpdateError);
						// Continue with other attributes
					}
				}
			}

			// Create new attributes
			if (attributesToCreate.length > 0) {
				const newAttributes = attributesToCreate.map((attribute) => ({
					attributeset_id: id,
					attribute_id: attribute.attribute_id,
					sequence: attribute.sequence ?? null,
					is_required: attribute.is_required,
					is_active: attribute.is_active,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				}));

				const { error: createError } = await locals.supabase
					.from('m_attributeset_attribute')
					.insert(newAttributes);

				if (createError) {
					console.error('Error creating new attributes:', createError);
					// Continue with redirect
				}
			}

			// Delete attributes that are no longer in the form
			const attributeIdsToKeep = attributesToUpdate
				.map((a) => a.id)
				.filter((id): id is number => id !== undefined);
			const attributeIdsToDelete = existingIds.filter((id) => !attributeIdsToKeep.includes(id));

			if (attributeIdsToDelete.length > 0) {
				const { error: deleteError } = await locals.supabase
					.from('m_attributeset_attribute')
					.delete()
					.in('id', attributeIdsToDelete);

				if (deleteError) {
					console.error('Error deleting attributes:', deleteError);
					// Continue with redirect
				}
			}
		}

		// Redirect to the attribute set list
		throw redirect(303, '/catalog/product-attributes/attribute-sets');
	}
};
