import { z } from 'zod';

export const catalogSearchParamsSchema = z.object({
	stock: z
		.string()
		.optional()
		.transform((val) => val === 'true'),
	report: z.string().optional(),
	showVat: z
		.string()
		.optional()
		.transform((val) => val === 'true'),
	sub: z
		.string()
		.optional()
		.transform((val) => val === 'true'),
	cat: z.string().optional()
});

export type CatalogSearchParams = z.infer<typeof catalogSearchParamsSchema>;
