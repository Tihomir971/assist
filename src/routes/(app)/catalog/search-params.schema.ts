import { z } from 'zod/v3';

export const catalogSearchParamsSchema = z.object({
	stock: z
		.string()
		.optional()
		.transform((val) => val === 'true'),
	report: z.string().optional(),
	vat: z
		.string()
		.optional()
		.transform((val) => val === 'true'),
	sub: z
		.string()
		.optional()
		.transform((val) => val === 'true'),
	cat: z.string().optional(),
	search: z.string().optional()
});
