export type CartItem = {
	id: number;
	name: string;
	quantity: number;
	sku: string; // Added SKU property
};

export interface Product {
	id: number;
	sku: string;
	name: string;
	barcode: string;
	mpn: string;
	unitsperpack: number;
	imageurl: string;
	discontinued: boolean;
	c_taxcategory?: { c_tax: { rate: number }[] } | null;
	m_storageonhand: { warehouse_id: number; qtyonhand: number }[];
	productPrice: {
		m_pricelist_version_id: number;
		pricestd: number | null;
		pricelist: number | null;
	}[];
	level_min: { m_warehouse_id: number; level_min: number }[];
	level_max: { m_warehouse_id: number; level_max: number }[];
	m_product_po: {
		c_bpartner_id: number;
		pricelist: number | null;
		vendorproductno: string | null;
	}[];
}

export interface FlattenedProduct {
	id: number;
	sku: string;
	name: string;
	barcode: string;
	mpn: string;
	unitsperpack: number;
	imageurl: string;
	discontinued: boolean;
	taxRate: number | null;
	qtyWholesale: number;
	qtyRetail: number;
	pricePurchase: number | null;
	priceRetail: number | null;
	ruc: number;
	levelMin: number | null;
	levelMax: number | null;
	vendorPrices: { [vendorId: number]: number | null };
	vendorProductNos: { [vendorId: number]: string | null };
	action: boolean;
	[key: string]: any;
}
