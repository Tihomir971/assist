export interface StructuredSupabaseError {
	title: string;
	details: string;
	constraint?: string;
	suggestion?: string;
	code?: string;
	isStructured: boolean;
}

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

/**
 * Extracts structured error information from a Supabase error object for enhanced user experience.
 *
 * @param error The error object from Supabase/PostgreSQL
 * @param operation The operation being performed (create, update, delete, etc.)
 * @param entityName The name of the entity being operated on
 * @returns Structured error information with title, details, and suggestions
 */
export function extractStructuredSupabaseError(
	error: unknown,
	operation: string = 'operation',
	entityName: string = 'item'
): StructuredSupabaseError {
	if (!isObject(error)) {
		return {
			title: `Failed to ${operation} ${entityName}`,
			details: 'An unexpected error occurred.',
			isStructured: false
		};
	}

	const code = 'code' in error && typeof error.code === 'string' ? error.code : undefined;
	const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
	const details = 'details' in error && typeof error.details === 'string' ? error.details : '';

	// Handle foreign key constraint violations
	if (
		details.includes('violates foreign key constraint') ||
		message.includes('violates foreign key constraint')
	) {
		const errorText = details || message;
		const constraintMatch = /violates foreign key constraint "([^"]+)"/.exec(errorText);
		const tableMatch = /on table "([^"]+)"/.exec(errorText);
		const constraint = constraintMatch?.[1];
		const referencedTable = tableMatch?.[1];

		let suggestion = 'Please remove the related data before deleting this item.';
		let friendlyDetails = 'This item is being used by other data and cannot be deleted.';

		// Provide specific suggestions based on constraint patterns
		if (constraint) {
			if (constraint.includes('attributeset_attribute')) {
				suggestion = 'Remove this attribute from all attribute sets before deleting it.';
				friendlyDetails = 'This attribute is currently being used by one or more attribute sets.';
			} else if (constraint.includes('product_attribute')) {
				suggestion = 'Remove this attribute from all products before deleting it.';
				friendlyDetails = 'This attribute is currently assigned to one or more products.';
			} else if (constraint.includes('category')) {
				suggestion = 'Move or delete all items in this category before deleting the category.';
				friendlyDetails = 'This category contains items that must be moved or deleted first.';
			} else if (constraint.includes('brand')) {
				suggestion = 'Reassign all products to a different brand before deleting this brand.';
				friendlyDetails = 'This brand is currently assigned to one or more products.';
			} else if (referencedTable) {
				suggestion = `Remove references from ${referencedTable.replace('_', ' ')} before deleting this item.`;
				friendlyDetails = `This item is referenced by data in ${referencedTable.replace('_', ' ')}.`;
			}
		}

		return {
			title: `Cannot ${operation} ${entityName}`,
			details: friendlyDetails,
			constraint,
			suggestion,
			code,
			isStructured: true
		};
	}

	// Handle unique constraint violations
	if (details.includes('violates unique constraint')) {
		const constraintMatch = /violates unique constraint "([^"]+)"/.exec(details);
		const keyMatch = /Key \(([^)]+)\)=\(([^)]+)\) already exists/.exec(details);
		const constraint = constraintMatch?.[1];
		const field = keyMatch?.[1];
		const value = keyMatch?.[2];

		let friendlyDetails = 'An item with conflicting data already exists.';
		let suggestion = 'Please use a different value and try again.';

		if (field && value) {
			friendlyDetails = `An item with the same ${field.replace('_', ' ')} ('${value}') already exists.`;
			suggestion = `Please choose a different ${field.replace('_', ' ')} and try again.`;
		}

		return {
			title: `Cannot ${operation} ${entityName}`,
			details: friendlyDetails,
			constraint,
			suggestion,
			code,
			isStructured: true
		};
	}

	// Handle check constraint violations
	if (details.includes('violates check constraint')) {
		const constraintMatch = /violates check constraint "([^"]+)"/.exec(details);
		const constraint = constraintMatch?.[1];

		return {
			title: `Invalid ${entityName} data`,
			details: 'The provided data does not meet the required validation rules.',
			constraint,
			suggestion: 'Please check your input values and ensure they meet the required criteria.',
			code,
			isStructured: true
		};
	}

	// Handle not-null constraint violations
	if (details.includes('null value in column')) {
		const columnMatch = /null value in column "([^"]+)"/.exec(details);
		const column = columnMatch?.[1];

		return {
			title: `Missing required ${entityName} data`,
			details: column
				? `The field '${column.replace('_', ' ')}' is required.`
				: 'A required field is missing.',
			suggestion: column
				? `Please provide a value for ${column.replace('_', ' ')}.`
				: 'Please fill in all required fields.',
			code,
			isStructured: true
		};
	}

	// Handle permission errors
	if (message.includes('permission denied') || code === '42501') {
		return {
			title: `Access denied`,
			details: `You don't have permission to ${operation} this ${entityName}.`,
			suggestion: 'Please contact your administrator if you believe you should have access.',
			code,
			isStructured: true
		};
	}

	// Fallback for other errors
	return {
		title: `Failed to ${operation} ${entityName}`,
		details: details || message || 'An unknown database error occurred.',
		code,
		isStructured: false
	};
}
