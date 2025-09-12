import { z } from 'zod';

export const deleteByIdSchema = z.object({
	id: z.number()
});
