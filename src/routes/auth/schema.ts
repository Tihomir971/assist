import { z } from 'zod/v3';

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

export type LoginSchema = typeof loginSchema;
