import { adUserRowSchema } from '$lib/types/supabase.zod.schemas';

export const crudSchema = adUserRowSchema.extend({
	id: adUserRowSchema.shape.id.optional(),
	created_at: adUserRowSchema.shape.created_at.optional(),
	updated_at: adUserRowSchema.shape.updated_at.optional()
});
