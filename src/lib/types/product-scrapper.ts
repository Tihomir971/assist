// Vendor-specific types
export type VendorId = 'idea' | 'cenoteka'; // Add more vendors as needed

export interface VendorProduct {
	vendorId: VendorId;
	sku: string;
	name: string | null;
	barcodes: string[] | null;
	price: number | null;
	href: string | null;
	brand: string | null;
	netQuantity: number | null;
	netQuantityUnit: string | null;
	images: string[] | null;
	shelfLife: number | null | undefined;
}
