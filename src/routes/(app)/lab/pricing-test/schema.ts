import { z } from 'zod';

export const pricingTestSchema = z.object({
	product_id: z.coerce.number().min(1, 'Product ID is required'),
	input_price: z.number().min(0.01, 'Input price must be greater than 0'),
	partner_id: z.coerce.number().optional(),
	quantity: z.coerce.number().min(1, 'Quantity must be at least 1').default(1),
	order_value: z.coerce.number().optional(),
	target_group: z.string().optional(),
	apply_vat: z.boolean().default(true),
	vat_rate: z.coerce.number().min(0).max(100).default(20).optional(),
	rounding_strategy: z.enum(['none', 'charming']).default('charming')
});

export type PricingTestInput = z.infer<typeof pricingTestSchema>;
