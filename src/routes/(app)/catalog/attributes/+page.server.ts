import { error } from '@sveltejs/kit';
import { attributesSearchParamsSchema, type AttributeType } from './schema';
import { superValidate } from 'sveltekit-superforms/server';
import { createAttributeSchema, deleteAttributeSchema } from './schema';
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

	// Prepare form for creating a new attribute
	const createForm = await superValidate(zod(createAttributeSchema));
	const deleteForm = await superValidate(zod(deleteAttributeSchema));

	return {
		attributes,
		attributeGroups,
		count: count || 0,
		page,
		perPage,
		createForm,
		deleteForm
	};
};

export const actions = {
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
