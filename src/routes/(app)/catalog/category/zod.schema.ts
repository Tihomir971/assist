import { z } from 'zod';

export const productCategorySchema = z.object({
	ad_org_id: z.number().optional(),
	created: z.string(),
	description: z.string().nullable(),
	id: z.number(),
	is_active: z.boolean(),
	isselfservice: z.boolean(),
	name: z.string(),
	parent_id: z.number().nullable(),
	updated: z.string(),
	value: z.string().nullable()
});
export const crudProductCategorySchema = productCategorySchema.extend({
	id: productCategorySchema.shape.id.optional()
});
