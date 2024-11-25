import { z } from 'zod';

export const shoppingCartSchema = z.object({
	id: z.number().positive(),
	product: z.object({
		id: z.number().positive(),
		name: z.string(),
		imageurl: z.string().nullable(),
		price: z.number().positive(),
		quantity: z.number().positive()
	})
});
export type ShoppingCartSchema = z.infer<typeof shoppingCartSchema>;
