export interface BarcodeSearchVendorData {
	href: string;
}

export interface BarcodeSearchVendorResult {
	productId: number;
	vendorId: VendorId;
	barcodes: string[];
	data?: BarcodeSearchVendorData;
	error?: {
		code: number;
		message: string;
	};
}

export type BarcodeSearchResponse = ApiResponse<BarcodeSearchVendorResult[]>;

export interface BarcodeSearchRequest {
	barcodes: string[];
	productId: number;
}
// Vendor-specific types
export type VendorId = 'idea' | 'cenoteka' | 'tehnomedia'; // Add more vendors as needed

export interface VendorProduct {
	sku: string | null;
	name: string | null;
	vendorId: VendorId;
	barcodes: string[] | null;
	price: number | null;
	href: string | null;
	brand: string | null;
	netQuantity: number | null;
	netQuantityUnit: string | null;
	images: string[] | null;
	shelfLife: number | null | undefined;
	valid_from: string | null;
	valid_to: string | null;
}

// API Response Types
export interface ApiError {
	code: string; // A unique error code for identifying the type of error
	message: string; // A human-readable error message describing what went wrong
}

export interface ApiResponse<T> {
	data?: T; // The successful response data
	error?: ApiError; // The structured error object
}

// Helper function to create API responses
export function createApiResponse<T>(
	data?: T,
	error?: { code: string; message: string }
): ApiResponse<T> {
	return { data, error };
}

// Helper function to create API errors
export function createApiError(code: string, message: string): ApiError {
	return { code, message };
}

// New types for batch processing
export interface ProductRequest {
	productId: number;
	href?: string;
	barcodes?: string[];
}

export interface BatchRequest {
	products: ProductRequest[];
	relevantShops?: string[];
	vendorId?: VendorId; // Added vendorId to support routing in scraper service
}

export enum ProductStatus {
	OK = 'ok',
	NOT_FOUND_BY_HREF = 'Not found by href',
	NOT_FOUND_BY_BARCODE = 'Not found by barcode',
	ERROR = 'error'
}

export interface ProductResult {
	product: VendorProduct | null;
	status: ProductStatus;
	productId: number;
}
