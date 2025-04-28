// Vendor-specific types

import type { VendorId } from './types-search-vendor-products';

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
