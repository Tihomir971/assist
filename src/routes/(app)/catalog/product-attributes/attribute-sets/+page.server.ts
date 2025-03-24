import { error } from '@sveltejs/kit';
import { attributeSetsSearchParamsSchema } from './schema';
import { superValidate } from 'sveltekit-superforms/server';
import { createAttributeSetSchema, deleteAttributeSetSchema } from './schema';
import { fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, url }: { locals: App.Locals; url: URL }) => {
	// Parse and validate search params
	const searchParams = Object.fromEntries(url.searchParams);
	const parsedParams = attributeSetsSearchParamsSchema.parse({
		...attributeSetsSearchParamsSchema.shape.page.default,
		...attributeSetsSearchParamsSchema.shape.perPage.default,
		...attributeSetsSearchParamsSchema.shape.order.default,
		...searchParams
	});

	const { page, perPage, sort, order, name, code, isActive } = parsedParams;

	// Calculate pagination values
	const from = (page - 1) * perPage;
	const to = from + perPage - 1;

	// Build query
	let query = locals.supabase.from('m_attributeset').select('*', { count: 'exact' });

	// Apply filters
	if (name) {
		query = query.ilike('name', `%${name}%`);
	}

	if (code) {
		query = query.ilike('code', `%${code}%`);
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
	const { data: attributeSets, error: queryError, count } = await query;

	if (queryError) {
		console.error('Error fetching attribute sets:', queryError);
		throw error(500, 'Error fetching attribute sets');
	}

	// Prepare form for creating a new attribute set
	const createForm = await superValidate(zod(createAttributeSetSchema));
	const deleteForm = await superValidate(zod(deleteAttributeSetSchema));

	return {
		attributeSets,
		count: count || 0,
		page,
		perPage,
		createForm,
		deleteForm
	};
};

export const actions = {
	create: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const form = await superValidate(request, zod(createAttributeSetSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, code, description } = form.data;

		const { error: insertError } = await locals.supabase.from('m_attributeset').insert({
			name,
			code,
			description,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			is_active: true
		});

		if (insertError) {
			console.error('Error creating attribute set:', insertError);
			return fail(500, {
				form,
				error: 'Failed to create attribute set'
			});
		}

		return { form };
	},

	delete: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const form = await superValidate(request, zod(deleteAttributeSetSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = form.data;

		// Check if the attribute set is used by any products
		const { data: usedByProducts, error: checkProductsError } = await locals.supabase
			.from('m_product')
			.select('id')
			.eq('attributeset_id', id)
			.limit(1);

		if (checkProductsError) {
			console.error('Error checking attribute set usage in products:', checkProductsError);
			return fail(500, {
				form,
				error: 'Failed to check if attribute set is in use'
			});
		}

		if (usedByProducts && usedByProducts.length > 0) {
			return fail(400, {
				form,
				error: 'Cannot delete attribute set that is in use by products'
			});
		}

		// Check if the attribute set has any attributes
		const { data: hasAttributes, error: checkAttributesError } = await locals.supabase
			.from('m_attributeset_attribute')
			.select('id')
			.eq('attributeset_id', id)
			.limit(1);

		if (checkAttributesError) {
			console.error('Error checking attribute set attributes:', checkAttributesError);
			return fail(500, {
				form,
				error: 'Failed to check if attribute set has attributes'
			});
		}

		// Delete attributes if they exist
		if (hasAttributes && hasAttributes.length > 0) {
			const { error: deleteAttributesError } = await locals.supabase
				.from('m_attributeset_attribute')
				.delete()
				.eq('attributeset_id', id);

			if (deleteAttributesError) {
				console.error('Error deleting attribute set attributes:', deleteAttributesError);
				return fail(500, {
					form,
					error: 'Failed to delete attribute set attributes'
				});
			}
		}

		// Delete the attribute set
		const { error: deleteError } = await locals.supabase
			.from('m_attributeset')
			.delete()
			.eq('id', id);

		if (deleteError) {
			console.error('Error deleting attribute set:', deleteError);
			return fail(500, {
				form,
				error: 'Failed to delete attribute set'
			});
		}

		return { form };
	}
};
