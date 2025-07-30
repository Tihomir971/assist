import { z } from 'zod/v4';

export const deleteByIdSchema = z.object({
	id: z.number()
});
