import { adUserRowSchema } from '$lib/types/supabase/supabase-zod-schemas';

export const crudSchema = adUserRowSchema.extend({
	id: adUserRowSchema.shape.id.optional(),
	created: adUserRowSchema.shape.created.optional(),
	updated: adUserRowSchema.shape.updated.optional()
});
