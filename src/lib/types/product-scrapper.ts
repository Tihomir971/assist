// Vendor-specific types
type VendorId = 'idea' | 'cenoteka'; // Add more vendors as needed

export interface VendorProduct {
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
