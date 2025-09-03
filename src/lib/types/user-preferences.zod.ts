import { z } from 'zod';

export const userPreferencesSchema = z
	.object({
		preferred_data_locale: z
			.string()
			.regex(/^[a-z]{2,3}(?:-[A-Za-z]{4})?(?:-[A-Z]{2})?$/, 'Invalid locale format')
			.optional()
	})
	.strict();

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
