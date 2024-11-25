import { z } from 'zod';

export const productSelectSchema = z.object({
	ids: z.string(),
	source: z.number().default(2)
});
