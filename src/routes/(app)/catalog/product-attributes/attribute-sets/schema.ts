import { z } from 'zod';
import {
	mAttributesetInsertSchema,
	mAttributesetUpdateSchema
} from '$lib/types/supabase.zod.schemas';

// Schema for attribute set list filtering and sorting
export const attributeSetsSearchParamsSchema = z.object({
	page: z.coerce.number().default(1),
	perPage: z.coerce.number().default(10),
	sort: z.string().optional(),
	order: z.enum(['asc', 'desc']).default('asc'),
	name: z.string().optional(),
	code: z.string().optional(),
	isActive: z.enum(['true', 'false', '']).optional()
});

export type AttributeSetsSearchParams = z.infer<typeof attributeSetsSearchParamsSchema>;

// Schema for creating a new attribute set - extending mAttributesetInsertSchema
export const createAttributeSetSchema = mAttributesetInsertSchema.extend({
	name: z.string().min(1, { message: 'Name is required' }).max(100),
	code: z.string().min(1, { message: 'Code is required' }).max(50)
});

// Schema for updating an attribute set - extending mAttributesetUpdateSchema
export const updateAttributeSetSchema = mAttributesetUpdateSchema.extend({
	id: z.number(),
	name: z.string().min(1, { message: 'Name is required' }).max(100),
	code: z.string().min(1, { message: 'Code is required' }).max(50)
});

// Schema for deleting an attribute set
export const deleteAttributeSetSchema = z.object({
	id: z.number()
});

// Schema for attribute set attributes
export const attributeSetAttributeSchema = z.object({
	id: z.number().optional(),
	attributeset_id: z.number(),
	attribute_id: z.number(),
	sequence: z.number().optional(),
	is_required: z.boolean().default(false),
	is_active: z.boolean().default(true)
});

// Schema for creating attribute set with attributes
export const createAttributeSetWithAttributesSchema = createAttributeSetSchema.extend({
	attributes: z.array(attributeSetAttributeSchema).optional()
});

// Schema for updating attribute set with attributes
export const updateAttributeSetWithAttributesSchema = updateAttributeSetSchema.extend({
	attributes: z.array(attributeSetAttributeSchema).optional()
});
