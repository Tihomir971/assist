import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { createAttributeSetWithAttributesSchema } from '../schema';

export const load = async ({ locals }: { locals: App.Locals }) => {
	// Fetch all available attributes for the dropdown
	const { data: attributes, error: attributesError } = await locals.supabase
		.from('m_attribute')
		.select('id, name, attribute_type')
		.order('name');

	if (attributesError) {
		console.error('Error fetching attributes:', attributesError);
		throw error(500, 'Error fetching attributes');
	}

	// Prepare the form
	const form = await superValidate(zod(createAttributeSetWithAttributesSchema));

	return {
		form,
		attributes
	};
};

export const actions = {
	create: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const form = await superValidate(request, zod(createAttributeSetWithAttributesSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, code, description, attributes } = form.data;

		// Create the attribute set
		const { data: attributeSet, error: createError } = await locals.supabase
			.from('m_attributeset')
			.insert({
				name,
				code,
				description,
				is_active: true,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.select('id')
			.single();

		if (createError) {
			console.error('Error creating attribute set:', createError);
			return fail(500, {
				form,
				error: 'Failed to create attribute set'
			});
		}

		// If it has attributes, create them
		if (attributes && attributes.length > 0 && attributeSet) {
			const attributeSetId = attributeSet.id;

			const attributeRecords = attributes.map((attribute, index) => ({
				attributeset_id: attributeSetId,
				attribute_id: attribute.attribute_id,
				sequence: attribute.sequence ?? index,
				is_required: attribute.is_required,
				is_active: attribute.is_active,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}));

			const { error: attributesError } = await locals.supabase
				.from('m_attributeset_attribute')
				.insert(attributeRecords);

			if (attributesError) {
				console.error('Error creating attribute set attributes:', attributesError);
				// Continue with redirect, as the attribute set was created
			}
		}

		// Redirect to the attribute set list
		throw redirect(303, '/catalog/product-attributes/attribute-sets');
	}
};
