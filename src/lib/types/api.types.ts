// API Response Types
interface ApiError {
	code: string; // A unique error code for identifying the type of error
	message: string; // A human-readable error message describing what went wrong
}

export interface ApiResponse<T> {
	data?: T; // The successful response data
	error?: ApiError; // The structured error object
}
