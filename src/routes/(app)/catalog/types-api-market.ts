export interface ProductRequest {
	productId: number;
	mpn: string | null;
	href?: string | null;
	barcodes?: string[];
}
