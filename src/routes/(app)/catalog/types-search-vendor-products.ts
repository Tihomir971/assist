export type VendorId = 'idea' | 'cenoteka' | 'tehnomedia'; // Add more vendors as needed

interface ProductResponseSearch {
	href: string;
}

export interface ProductsResultSearch {
	productId: number;
	vendorId: VendorId;
	barcodes: string[];
	data?: ProductResponseSearch;
	error?: {
		code: number;
		message: string;
	};
}
