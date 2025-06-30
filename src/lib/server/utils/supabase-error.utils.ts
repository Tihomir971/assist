/**
 * Checks if a value is a non-null object.
 * @param value The value to check.
 * @returns True if the value is a non-null object, false otherwise.
 */
function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Extracts a more user-friendly error message from a Supabase error object.
 *
 * @param error The error object, which can be of any type.
 * @returns A string containing a more readable error message.
 */
export function extractSupabaseErrorInfo(error: unknown): string {
	if (!isObject(error)) {
		return 'An unexpected error occurred.';
	}

	// Handle PostgREST-specific errors which have a specific structure
	if ('details' in error && typeof error.details === 'string') {
		// Foreign key violation
		if (error.details.includes('violates foreign key constraint')) {
			return `Operation failed because the item is referenced by other data. Please remove the related data before deleting this item.`;
		}
		// Unique constraint violation
		if (error.details.includes('violates unique constraint')) {
			const detailMatch = /Key \(([^)]+)\)=\(([^)]+)\) already exists/.exec(error.details);
			if (detailMatch) {
				return `An item with the same ${detailMatch[1]} ('${detailMatch[2]}') already exists.`;
			}
			return 'An item with a conflicting value already exists.';
		}
		return error.details;
	}

	if ('message' in error && typeof error.message === 'string') {
		return error.message;
	}

	return 'An unknown database error occurred. Please check the logs for more details.';
}
