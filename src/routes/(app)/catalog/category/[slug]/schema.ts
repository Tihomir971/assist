import {
	cChannelMapCategoryRowSchema,
	mProductCategoryRowSchema
} from '$lib/types/supabase/supabase-zod-schemas';

export const crudMProductCategorySchema = mProductCategoryRowSchema
	.extend({
		id: mProductCategoryRowSchema.shape.id.optional()
	})
	.omit({
		created_at: true,
		updated_at: true
	})
	.passthrough();
export type CrudMProductCategorySchema = typeof crudMProductCategorySchema;

export const crudCChannelMapCategorySchema = cChannelMapCategoryRowSchema
	.extend({
		id: cChannelMapCategoryRowSchema.shape.id.optional()
	})
	.omit({
		created_at: true,
		updated_at: true
	})
	.passthrough();
export type CrudCChannelMapCategorySchema = typeof crudCChannelMapCategorySchema;
