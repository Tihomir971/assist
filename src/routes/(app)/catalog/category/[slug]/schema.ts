import {
	cChannelMapCategoryRowSchema,
	mProductCategoryRowSchema
} from '$lib/types/supabase-zod-schemas';

export const crudMProductCategorySchema = mProductCategoryRowSchema
	.extend({
		id: mProductCategoryRowSchema.shape.id.optional()
	})
	.omit({
		created: true,
		updated: true
	})
	.passthrough();
export type CrudMProductCategorySchema = typeof crudMProductCategorySchema;

export const crudCChannelMapCategorySchema = cChannelMapCategoryRowSchema
	.extend({
		id: cChannelMapCategoryRowSchema.shape.id.optional()
	})
	.omit({
		created: true,
		updated: true
	})
	.passthrough();
export type CrudCChannelMapCategorySchema = typeof crudCChannelMapCategorySchema;
