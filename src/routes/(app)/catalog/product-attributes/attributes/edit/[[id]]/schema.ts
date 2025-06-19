import { mAttributeInsertSchema } from '$lib/types/supabase.zod.schemas';
import { z } from 'zod';

// Create a form-specific schema with coercion for the attribute group ID
export const mAttributeFormSchema = mAttributeInsertSchema.extend({
	attribute_group_id: z.coerce.number().positive({ message: 'Attribute group is required.' })
});
