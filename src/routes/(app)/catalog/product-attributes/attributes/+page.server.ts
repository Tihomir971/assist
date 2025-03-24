import { error } from '@sveltejs/kit';
import { attributesSearchParamsSchema, type AttributeType } from './schema.js';
import { superValidate } from 'sveltekit-superforms/server';
import {
	createAttributeSchema,
	createAttributeOptionsSchema,
	deleteAttributeSchema
} from './schema.js';
import { fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, url }: { locals: App.Locals; url: URL }) => {
	// Parse and validate search params
	const searchParams = Object.fromEntries(url.searchParams);
	const parsedParams = attributesSearchParamsSchema.parse({
		...attributesSearchParamsSchema.shape.page.default,
		...attributesSearchParamsSchema.shape.perPage.default,
		...attributesSearchParamsSchema.shape.order.default,
		...searchParams
	});

	const { page, perPage, sort, order, name, code, attributeType, attributeGroupId, isActive } =
		parsedParams;

	// Calculate pagination values
	const from = (page - 1) * perPage;
	const to = from + perPage - 1;

	// Build query
	let query = locals.supabase
		.from('m_attribute')
		.select('*, m_attribute_group!inner(*)', { count: 'exact' });

	// Apply filters
	if (name) {
		query = query.ilike('name', `%${name}%`);
	}

	if (code) {
		query = query.ilike('code', `%${code}%`);
	}

	if (attributeType) {
		query = query.eq('attribute_type', attributeType as AttributeType);
	}

	if (attributeGroupId) {
		query = query.eq('attribute_group_id', attributeGroupId);
	}

	if (isActive !== undefined && isActive !== '') {
		query = query.eq('is_active', isActive === 'true');
	}

	// Apply sorting
	if (sort) {
		query = query.order(sort, { ascending: order === 'asc' });
	} else {
		query = query.order('name', { ascending: true });
	}

	// Apply pagination
	query = query.range(from, to);

	// Execute query
	const { data: attributes, error: queryError, count } = await query;

	if (queryError) {
		console.error('Error fetching attributes:', queryError);
		throw error(500, 'Error fetching attributes');
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

	// Prepare forms
	const createForm = await superValidate(zod(createAttributeSchema));
	const createOptionsForm = await superValidate(zod(createAttributeOptionsSchema));
	const deleteForm = await superValidate(zod(deleteAttributeSchema));

	return {
		attributes,
		attributeGroups,
		count: count || 0,
		page,
		perPage,
		createForm,
		createOptionsForm,
		deleteForm
	};
};

export const actions = {
	createAttribute: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		// Validate the form data
		const form = await superValidate(request, zod(createAttributeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, code, attribute_type, attribute_group_id, description } = form.data;

		// Insert the attribute
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

		// Return the created attribute ID for client-side redirection
		return {
			form,
			success: true,
			attributeId: attribute.id
		};
	},

	createAttributeOption: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		// Validate the form data
		const form = await superValidate(request, zod(createAttributeOptionsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { attribute_id, options } = form.data;

		// Check if attribute exists and is of selection type
		const { data: attribute, error: attributeError } = await locals.supabase
			.from('m_attribute')
			.select('attribute_type')
			.eq('id', attribute_id)
			.single();

		if (attributeError) {
			console.error('Error fetching attribute:', attributeError);
			return fail(500, {
				form,
				error: 'Failed to fetch attribute'
			});
		}

		if (
			attribute.attribute_type !== 'single_select' &&
			attribute.attribute_type !== 'multi_select'
		) {
			return fail(400, {
				form,
				error: 'Options can only be added to selection type attributes'
			});
		}

		// Insert options
		const optionsToInsert = options.map((option, index) => ({
			attribute_id,
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
			return fail(500, {
				form,
				error: 'Failed to create attribute options'
			});
		}

		return {
			form,
			success: true
		};
	},

	delete: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const form = await superValidate(request, zod(deleteAttributeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = form.data;

		// Check if the attribute is used by any attribute sets
		const { data: usedInSets, error: checkSetsError } = await locals.supabase
			.from('m_attributeset_attribute')
			.select('id')
			.eq('attribute_id', id)
			.limit(1);

		if (checkSetsError) {
			console.error('Error checking attribute usage in sets:', checkSetsError);
			return fail(500, {
				form,
				error: 'Failed to check if attribute is in use'
			});
		}

		if (usedInSets && usedInSets.length > 0) {
			return fail(400, {
				form,
				error: 'Cannot delete attribute that is used in attribute sets'
			});
		}

		// Check if the attribute has any options
		const { data: hasOptions, error: checkOptionsError } = await locals.supabase
			.from('m_attribute_option')
			.select('id')
			.eq('attribute_id', id)
			.limit(1);

		if (checkOptionsError) {
			console.error('Error checking attribute options:', checkOptionsError);
			return fail(500, {
				form,
				error: 'Failed to check if attribute has options'
			});
		}

		// Delete options if they exist
		if (hasOptions && hasOptions.length > 0) {
			const { error: deleteOptionsError } = await locals.supabase
				.from('m_attribute_option')
				.delete()
				.eq('attribute_id', id);

			if (deleteOptionsError) {
				console.error('Error deleting attribute options:', deleteOptionsError);
				return fail(500, {
					form,
					error: 'Failed to delete attribute options'
				});
			}
		}

		// Delete the attribute
		const { error: deleteError } = await locals.supabase.from('m_attribute').delete().eq('id', id);

		if (deleteError) {
			console.error('Error deleting attribute:', deleteError);
			return fail(500, {
				form,
				error: 'Failed to delete attribute'
			});
		}

		return { form };
	}
};
