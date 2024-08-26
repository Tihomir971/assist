export interface Product {
	name: string;
	vendorproductno: string;
	pricelist: number;
	barcode: string;
	vendorcategory: string;
	manufacturer: string;
}
// New interface for products during the update process
export interface ProductToUpdate extends Product {
	id: number;
	normalizedVendorProductNo: string;
}

export interface Mapping {
	name: string;
	vendorproductno: string;
	pricelist: string;
	barcode: string;
	vendorcategory: string;
	manufacturer: string;
}

export interface Supplier {
	id: number;
	name: string;
}
