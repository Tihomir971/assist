import * as z from 'zod';

export const catalogSearchParamsSchema = z.object({
	wh: z.coerce.number().optional().nullable().default(null),
	stock: z.boolean().optional().default(false),
	report: z.enum(['all', 'relocation', 'replenish']).optional().nullable().default(null),
	vat: z.boolean().optional().default(false),
	sub: z.boolean().optional().default(false),
	cat: z.string().optional().nullable().default(null),
	search: z.string().optional().nullable().default(null)
});
