interface BarcodeSearchVendorData {
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
interface ApiError {
	code: string; // A unique error code for identifying the type of error
	message: string; // A human-readable error message describing what went wrong
}

interface ApiResponse<T> {
	data?: T; // The successful response data
	error?: ApiError; // The structured error object
}
