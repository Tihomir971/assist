import { mProductCategoryRowSchema } from '$lib/types/supabase-zod-schemas';

export const crudMProductCategorySchema = mProductCategoryRowSchema.extend({
	id: mProductCategoryRowSchema.shape.id.optional(),
	created: mProductCategoryRowSchema.shape.created.optional(),
	updated: mProductCategoryRowSchema.shape.updated.optional()
});
export type CrudMProductCategorySchema = typeof crudMProductCategorySchema;
