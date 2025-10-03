import { pricingConditionsSchema, pricingFormulaSchema } from '$lib/types/pricing-rules.zod';
import * as z from 'zod';

export const formSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, 'Name is required'),
	conditions: pricingConditionsSchema.optional(),
	formula: pricingFormulaSchema.optional(),
	priority: z.number(),
	is_active: z.boolean().optional(),
	target_group: z.string().nullable().optional(),
	starts_at: z.string().nullable().optional(),
	ends_at: z.string().nullable().optional()
});
