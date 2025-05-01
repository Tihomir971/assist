import { z } from 'zod';
import {
	attributeTypeSchema,
	mAttributeInsertSchema,
	mAttributeUpdateSchema,
	mAttributeOptionInsertSchema
} from '$lib/types/supabase.zod.schemas';

// Schema for attribute list filtering and sorting
export const attributesSearchParamsSchema = z.object({
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

export type AttributesSearchParams = z.infer<typeof attributesSearchParamsSchema>;

// Reusing attributeTypeSchema from supabase.zod.schemas.ts
export type AttributeType = z.infer<typeof attributeTypeSchema>;

// Schema for creating a new attribute - extending mAttributeInsertSchema
export const createAttributeSchema = mAttributeInsertSchema.extend({
	name: z.string().min(1, { message: 'Name is required' }).max(100),
	code: z.string().min(1, { message: 'Code is required' }).max(50),
	attribute_group_id: z.number().int().positive()
});

// Schema for updating an attribute - extending mAttributeUpdateSchema
export const updateAttributeSchema = mAttributeUpdateSchema.extend({
	id: z.number(),
	name: z.string().min(1, { message: 'Name is required' }).max(100),
	code: z.string().min(1, { message: 'Code is required' }).max(50),
	attribute_group_id: z.number().int().positive()
});

// Schema for deleting an attribute
export const deleteAttributeSchema = z.object({
	id: z.number()
});

// Schema for attribute option - extending mAttributeOptionInsertSchema
export const attributeOptionSchema = mAttributeOptionInsertSchema.extend({
	name: z.string().min(1, { message: 'Option name is required' }).max(100),
	code: z.string().min(1, { message: 'Option code is required' }).max(50)
});

// Schema for creating attribute with options
export const createAttributeWithOptionsSchema = createAttributeSchema.extend({
	options: z.array(attributeOptionSchema).optional()
});

// Schema for updating attribute with options
export const updateAttributeWithOptionsSchema = updateAttributeSchema.extend({
	options: z.array(attributeOptionSchema).optional()
});

// Schema for creating attribute options
export const createAttributeOptionsSchema = z.object({
	attribute_id: z.number().int().positive(),
	options: z.array(attributeOptionSchema)
});
