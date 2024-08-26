import { z } from 'zod';

export const formSchema = z.object({
	description: z.string().nullable().optional(),
	id: z.number().int().nonnegative(),
	isactive: z.boolean().default(true),
	isselfservice: z.boolean().default(false),
	name: z.string(),
	parent_id: z.number().int().nullable().optional()
});

export type FormSchema = typeof formSchema;
