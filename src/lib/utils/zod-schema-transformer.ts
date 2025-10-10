import { z } from 'zod';

/**
 * Transforms a Zod schema by:
 * 1. Removing `.nullable()` from fields
 * 2. Adding transform to convert empty strings to null for those fields
 *
 * @param schema The original Zod schema
 * @returns A new Zod schema with the transformations applied
 */
export function transformNullableSchema<T extends z.ZodTypeAny>(schema: T) {
	return z.preprocess((data) => {
		if (typeof data !== 'object' || data === null) {
			return data;
		}

		const result: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(data)) {
			// Convert empty strings to null
			if (value === '') {
				result[key] = null;
			} else {
				result[key] = value;
			}
		}

		return result;
	}, schema);
}

/**
 * Creates a Standard Schema v1 from a Zod schema with empty string to null transformation
 * @param schema The original Zod schema
 * @returns A Standard Schema v1 compatible object
 */
export function createStandardSchemaFromZod<T extends z.ZodTypeAny>(schema: T) {
	type InputType = z.input<T>;
	type OutputType = z.output<T>;

	const standardSchema = {
		'~standard': {
			version: 1 as const,
			vendor: 'zod' as const,
			types: {
				input: {} as InputType,
				output: {} as OutputType
			},
			validate: (
				input: unknown
			):
				| { success: true; value: OutputType }
				| {
						success: false;
						issues: Array<{ code: string; message: string; path: Array<string | number> }>;
				  } => {
				// First transform empty strings to null
				let transformedInput = input;
				if (typeof input === 'object' && input !== null) {
					transformedInput = {};
					for (const [key, value] of Object.entries(input)) {
						if (value === '') {
							(transformedInput as Record<string, unknown>)[key] = null;
						} else {
							(transformedInput as Record<string, unknown>)[key] = value;
						}
					}
				}

				// Then validate with the original schema
				const result = schema.safeParse(transformedInput);

				if (result.success) {
					return {
						success: true,
						value: result.data
					};
				} else {
					return {
						success: false,
						issues: result.error.issues.map((issue) => ({
							code: issue.code,
							message: issue.message,
							path: issue.path.map((p) => String(p))
						}))
					};
				}
			}
		}
	};

	return standardSchema;
}

/**
 * Example usage:
 *
 * // Original schema with nullable fields
 * const originalSchema = z.object({
 *   name: z.string().nullable(),
 *   email: z.string().nullable().optional(),
 *   age: z.number().nullable()
 * });
 *
 * // Transform to standard schema
 * const standardSchema = createStandardSchemaFromZod(originalSchema);
 *
 * // Now empty strings will be converted to null during validation
 * const result = standardSchema['~standard'].validate({
 *   name: '',
 *   email: 'test@example.com',
 *   age: 25
 * });
 * // Result: { success: true, value: { name: null, email: 'test@example.com', age: 25 } }
 */
