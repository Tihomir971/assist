import { z } from 'zod';

export const productCategorySchema = z.object({
	created_at: z.string(),
	description: z.string().nullable(),
	id: z.number(),
	is_active: z.boolean(),
	is_self_service: z.boolean(),
	name: z.string(),
	parent_id: z.number().nullable(),
	updated_at: z.string(),
	value: z.string().nullable()
});
export const crudProductCategorySchema = productCategorySchema.extend({
	id: productCategorySchema.shape.id.optional()
});
