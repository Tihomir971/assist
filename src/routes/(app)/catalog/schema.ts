import { z } from 'zod/v3';

export const productSelectSchema = z.object({
	ids: z.string(),
	source: z.number().default(2),
	type: z.enum(['search', 'get'])
});
