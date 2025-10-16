import * as z from 'zod';

export const catalogSearchParamsSchema = z.object({
	wh: z.coerce.number().nullable().default(null),
	stock: z.boolean().default(false),
	report: z.enum(['all', 'relocation', 'replenish']).nullable().default(null),
	vat: z.boolean().default(false),
	sub: z.boolean().default(false),
	cat: z.coerce.number().nullable().default(null),
	search: z.string().nullable().default(null)
});
