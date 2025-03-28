import { mAttributeGroupInsertSchema } from '$lib/types/supabase/supabase-zod-schemas';
import { z } from 'zod';

// Schema for attribute group list filtering and sorting
export const attributeGroupsSearchParamsSchema = z.object({
	page: z.coerce.number().default(1),
	perPage: z.coerce.number().default(10),
	sort: z.string().optional(),
	order: z.enum(['asc', 'desc']).default('asc'),
	name: z.string().optional(),
	isActive: z.enum(['true', 'false', '']).optional()
});

export type AttributeGroupsSearchParams = z.infer<typeof attributeGroupsSearchParamsSchema>;

// Schema for creating a new attribute group
export const createAttributeGroupSchema = mAttributeGroupInsertSchema.extend({
	name: z.string().min(1, { message: 'Name is required' }).max(100),
	code: z.string().min(1, { message: 'Code is required' }).max(50)
});

// Schema for deleting an attribute group
export const deleteAttributeGroupSchema = z.object({
	id: z.number()
});
