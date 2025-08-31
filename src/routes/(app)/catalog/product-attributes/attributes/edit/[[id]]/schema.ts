import { mAttributeInsertSchema } from '$lib/types/supabase.schemas';
import { z } from 'zod/v4';

// Create a form-specific schema with coercion for the attribute group ID
export const mAttributeFormSchema = mAttributeInsertSchema.extend({
	attribute_group_id: z.coerce.number().positive({ message: 'Attribute group is required.' }),
	c_uom_id: z.coerce.number().optional().nullable()
});
