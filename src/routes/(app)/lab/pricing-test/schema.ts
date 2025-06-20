import { z } from 'zod';

export const pricingTestSchema = z.object({
	product_id: z.coerce.number().min(1, 'Product ID is required'),
	base_price: z.coerce.number().optional(),
	cost_price: z.coerce.number().min(0.01, 'Cost price must be greater than 0'),
	retail_price: z.coerce.number().optional(),
	partner_id: z.coerce.number().optional(),
	quantity: z.coerce.number().min(1, 'Quantity must be at least 1').default(1),
	order_value: z.coerce.number().optional(),
	target_group: z.string().optional()
});

export type PricingTestInput = z.infer<typeof pricingTestSchema>;
