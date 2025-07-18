import { mAttributeInsertSchema } from '@tihomir971/assist-shared';
import { z } from 'zod/v3';

// Create a form-specific schema with coercion for the attribute group ID
export const mAttributeFormSchema = mAttributeInsertSchema.extend({
	attribute_group_id: z.coerce.number().positive({ message: 'Attribute group is required.' }),
	c_uom_id: z.coerce.number().optional().nullable()
});
