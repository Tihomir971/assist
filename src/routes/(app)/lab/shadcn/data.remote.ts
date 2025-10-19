import { form } from '$app/server';
import * as z from 'zod';

const schema = z.object({ framework: z.string() });

export const forma = form(schema, (formData) => {
	console.log(formData);
});
