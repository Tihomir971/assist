import { error, fail, redirect } from '@sveltejs/kit';
import { attributeGroupsSearchParamsSchema } from './schema.js';
import { superValidate } from 'sveltekit-superforms/server';
import { createAttributeGroupSchema, deleteAttributeGroupSchema } from './schema.js';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, url }: { locals: App.Locals; url: URL }) => {
	// Parse and validate search params
	const searchParams = Object.fromEntries(url.searchParams);
	const parsedParams = attributeGroupsSearchParamsSchema.parse({
		...attributeGroupsSearchParamsSchema.shape.page.default,
		...attributeGroupsSearchParamsSchema.shape.perPage.default,
		...attributeGroupsSearchParamsSchema.shape.order.default,
		...searchParams
	});

	const { page, perPage, sort, order, name, isActive } = parsedParams;

	// Calculate pagination values
	const from = (page - 1) * perPage;
	const to = from + perPage - 1;

	// Build query
	let query = locals.supabase.from('m_attribute_group').select('*', { count: 'exact' });

	// Apply filters
	if (name) {
		query = query.ilike('name', `%${name}%`);
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
	const { data: attributeGroups, error: queryError, count } = await query;

	if (queryError) {
		console.error('Error fetching attribute groups:', queryError);
		throw error(500, 'Error fetching attribute groups');
	}

	// Prepare form for creating a new attribute group
	const createForm = await superValidate(zod(createAttributeGroupSchema));
	const deleteForm = await superValidate(zod(deleteAttributeGroupSchema));

	return {
		attributeGroups,
		count: count || 0,
		page,
		perPage,
		createForm,
		deleteForm
	};
};

export const actions = {
	create: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const form = await superValidate(request, zod(createAttributeGroupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, code } = form.data;

		const { data: newGroup, error: insertError } = await locals.supabase
			.from('m_attribute_group')
			.insert({
				name,
				code
			})
			.select('id') // Return the ID of the newly created record
			.single();

		if (insertError) {
			console.error('Error creating attribute group:', insertError);
			return fail(500, {
				form,
				error: 'Failed to create attribute group'
			});
		}

		// Redirect to the edit page
		throw redirect(303, `/catalog/product-attributes/attribute-groups/${newGroup.id}`);
	},

	delete: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const form = await superValidate(request, zod(deleteAttributeGroupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = form.data;

		// Check if the attribute group is used by any attributes
		const { data: usedAttributes, error: checkError } = await locals.supabase
			.from('m_attribute')
			.select('id')
			.eq('attribute_group_id', id)
			.limit(1);

		if (checkError) {
			console.error('Error checking attribute group usage:', checkError);
			return fail(500, {
				form,
				error: 'Failed to check if attribute group is in use'
			});
		}

		if (usedAttributes && usedAttributes.length > 0) {
			return fail(400, {
				form,
				error: 'Cannot delete attribute group that is in use by attributes'
			});
		}

		const { error: deleteError } = await locals.supabase
			.from('m_attribute_group')
			.delete()
			.eq('id', id);

		if (deleteError) {
			console.error('Error deleting attribute group:', deleteError);
			return fail(500, {
				form,
				error: 'Failed to delete attribute group'
			});
		}

		return { form };
	}
};
