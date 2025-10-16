/**
 * Standardized response type for Svelte remote functions
 * Provides a consistent structure for both successful and error responses
 */
export interface RemoteResponse<T = unknown> {
	/** Whether the operation was successful */
	success: boolean;
	/** Human-readable message describing the result */
	message: string;
	/** The response data (null for errors, actual data for success) */
	data: T | null;
}

/**
 * Helper function to create a successful response
 */
export function createSuccessResponse<T>(message: string, data: T): RemoteResponse<T> {
	return {
		success: true,
		message,
		data
	};
}

/**
 * Helper function to create an error response
 */
export function createErrorResponse(message: string): RemoteResponse<null> {
	return {
		success: false,
		message,
		data: null
	};
}

/**
 * Helper function to create an error response with additional data
 */
export function createErrorResponseWithData<T>(message: string, data: T): RemoteResponse<T> {
	return {
		success: false,
		message,
		data
	};
}

/**
 * Type for a batch response (when multiple operations are performed)
 */
export interface BatchResponse<T = unknown> extends RemoteResponse<T> {
	/** Number of items that were successfully processed */
	successCount?: number;
	/** Number of items that failed processing */
	errorCount?: number;
	/** Array of individual error messages (if applicable) */
	errors?: string[];
}

/**
 * Helper function to create a batch response
 */
export function createBatchResponse<T>(
	success: boolean,
	message: string,
	data: T | null,
	successCount?: number,
	errorCount?: number,
	errors?: string[]
): BatchResponse<T> {
	return {
		success,
		message,
		data,
		successCount,
		errorCount,
		errors
	};
}
