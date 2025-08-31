import { z } from 'zod';

// Base schema for multilingual data
export const multilingualDataSchema = z.record(z.string(), z.string());

// Schema factory for multilingual fields with configuration
export function createMultilingualSchema(config: {
	required?: string[];
	minLength?: number;
	defaultLocale?: string;
}) {
	let schema = z.record(z.string(), z.string());

	// Add length validation if specified
	if (config.minLength) {
		const stringSchema = z.string();
		if (config.minLength) stringSchema.min(config.minLength);
		schema = z.record(z.string(), stringSchema);
	}

	// Add custom validation for required locales
	if (config.required && config.required.length > 0) {
		schema = schema.refine(
			(data) => {
				return config.required!.every((locale) => data[locale] && data[locale].trim().length > 0);
			},
			{
				message: `Required locales must have content: ${config.required.join(', ')}`,
				path: config.required
			}
		);
	}

	// Ensure default locale has content if specified
	if (config.defaultLocale) {
		schema = schema.refine(
			(data) => data[config.defaultLocale!] && data[config.defaultLocale!].trim().length > 0,
			{
				message: `Default locale (${config.defaultLocale}) must have content`,
				path: [config.defaultLocale]
			}
		);
	}

	return schema;
}

// Predefined schemas for common use cases
export const multilingualNamesSchema = createMultilingualSchema({
	required: ['en-US'],
	defaultLocale: 'en-US'
});

export const multilingualDescriptionsSchema = createMultilingualSchema({
	defaultLocale: 'en-US'
});
