import { z, type ZodType, type ZodObject } from 'zod';

/**
 * Checks if a field is required in a Zod schema object.
 *
 * @param schema - The Zod schema object to check
 * @param fieldName - The name of the field to check
 * @returns true if the field is required, false if it's optional
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   id: z.string(),
 *   name: z.string().optional(),
 *   age: z.number().optional()
 * });
 *
 * console.log(isRequired(schema, "id"));   // true
 * console.log(isRequired(schema, "name")); // false
 * console.log(isRequired(schema, "age"));  // false
 * ```
 */
export function isRequired(schema: ZodType, fieldName: string): boolean {
	// Check if the schema is an object schema
	if (!(schema instanceof z.ZodObject)) {
		return false;
	}

	// Get the shape of the schema
	const shape = schema.shape;

	// Check if the field exists in the shape
	if (!shape[fieldName]) {
		return false;
	}

	// Get the field's schema
	const fieldSchema = shape[fieldName];

	// Check if the field is optional
	if (fieldSchema instanceof z.ZodOptional) {
		return false;
	}

	// Check if the field has a default value (which makes it effectively optional)
	if (fieldSchema instanceof z.ZodDefault) {
		return false;
	}

	// For nullable fields, check if they're also optional
	if (fieldSchema instanceof z.ZodNullable) {
		// If it's nullable but not optional, it's still required (just can be null)
		return !(fieldSchema.unwrap() instanceof z.ZodOptional);
	}

	// For all other cases, the field is required
	return true;
}

/**
 * Gets all required field names from a Zod object schema.
 *
 * @param schema - The Zod schema object to analyze
 * @returns An array of required field names
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   id: z.string(),
 *   name: z.string().optional(),
 *   email: z.string().email(),
 *   age: z.number().optional()
 * });
 *
 * console.log(getRequiredFields(schema)); // ["id", "email"]
 * ```
 */
export function getRequiredFields(schema: ZodObject): string[] {
	const requiredFields: string[] = [];

	const shape = schema.shape;

	for (const fieldName of Object.keys(shape)) {
		if (isRequired(schema, fieldName)) {
			requiredFields.push(fieldName);
		}
	}

	return requiredFields;
}

/**
 * Gets all optional field names from a Zod object schema.
 *
 * @param schema - The Zod schema object to analyze
 * @returns An array of optional field names
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   id: z.string(),
 *   name: z.string().optional(),
 *   email: z.string().email(),
 *   age: z.number().optional()
 * });
 *
 * console.log(getOptionalFields(schema)); // ["name", "age"]
 * ```
 */
export function getOptionalFields(schema: ZodObject): string[] {
	const optionalFields: string[] = [];

	const shape = schema.shape;

	for (const fieldName of Object.keys(shape)) {
		if (!isRequired(schema, fieldName)) {
			optionalFields.push(fieldName);
		}
	}

	return optionalFields;
}
