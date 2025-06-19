import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';
import { AttributeService } from '$lib/services/supabase/attribute.service';
import { AttributeGroupService } from '$lib/services/supabase/attribute-group.service';
import type { PublicAttributeType } from '$lib/types/supabase.zod.schemas.d.js';

const attributesSearchParamsSchema = z.object({
	page: z.coerce.number().default(1),
	perPage: z.coerce.number().default(10),
	sort: z.string().optional(),
	order: z.enum(['asc', 'desc']).default('asc'),
	name: z.string().optional(),
	code: z.string().optional(),
	attributeType: z.string().optional(),
	attributeGroupId: z.coerce.number().optional(),
	isActive: z.enum(['true', 'false', '']).optional()
});

export const load = async ({ locals: { supabase }, url }) => {
	const searchParams = Object.fromEntries(url.searchParams);
	const parsedParams = attributesSearchParamsSchema.parse(searchParams);

	const { page, perPage, sort, order, name, code, attributeType, attributeGroupId, isActive } =
		parsedParams;

	const from = (page - 1) * perPage;
	const to = from + perPage - 1;

	let query = supabase
		.from('m_attribute')
		.select('*, m_attribute_group!inner(*)', { count: 'exact' });

	if (name) query = query.ilike('name', `%${name}%`);
	if (code) query = query.ilike('code', `%${code}%`);
	if (attributeType) query = query.eq('attribute_type', attributeType as PublicAttributeType);
	if (attributeGroupId) query = query.eq('attribute_group_id', attributeGroupId);
	if (isActive !== undefined && isActive !== '') query = query.eq('is_active', isActive === 'true');

	if (sort) {
		query = query.order(sort, { ascending: order === 'asc' });
	} else {
		query = query.order('name', { ascending: true });
	}

	query = query.range(from, to);

	const { data: attributes, error: queryError, count } = await query;
	if (queryError) {
		console.error('Error fetching attributes:', queryError);
		throw error(500, 'Error fetching attributes');
	}

	const { data: attributesNew } = await supabase
		.from('m_attribute')
		.select('*,m_attribute_group(name)')
		.order('name');

	const attributeGroupService = new AttributeGroupService(supabase);
	const attributeGroups = await attributeGroupService.getLookup();

	return {
		attributes,
		attributesNew: attributesNew ?? [],
		attributeGroups,
		count: count || 0,
		page,
		perPage,
		deleteForm: await superValidate(zod4(deleteByIdSchema))
	};
};

export const actions = {
	delete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(deleteByIdSchema));
		if (!form.valid) return fail(400, { form });

		const attributeService = new AttributeService(supabase);
		try {
			await attributeService.delete(Number(form.data.id));
			return { form };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unknown error occurred.';
			return fail(500, { form, error: message });
		}
	}
};
