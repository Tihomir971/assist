export interface ProductRequest {
	productId: number;
	mpn: string | null;
	href?: string | null;
	barcodes?: string[];
}
export type ProductSearchRequest = {
	barcodes: string[];
	productId: number;
	model: string | null | undefined;
};

// Product Serach
export type VendorId = 'idea' | 'cenoteka' | 'tehnomedia'; // Add more vendors as needed

export interface ProductSearchData {
	href: string;
}

export interface ApiProductSearchResponse {
	productId: number;
	vendorId: VendorId;
	barcodes: string[];
	data?: ProductSearchData;
	error?: {
		code: number | string;
		message: string;
	};
}

// Vendor-specific types

export interface ProductResponseGet {
	sku: string;
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

export enum ProductStatus {
	OK = 'OK',
	NOT_FOUND_BY_HREF = 'Not found by href',
	NOT_FOUND_BY_BARCODE = 'Not found by barcode',
	ERROR = 'error'
}
export interface ProductResultGet {
	product: ProductResponseGet | null;
	status: ProductStatus;
	productId: number;
}
