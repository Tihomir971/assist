export type CartItem = {
	id: number;
	name: string;
	quantity: number;
	sku: string | null; // Added SKU property
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
	m_productprice: {
		m_pricelist_version_id: number;
		pricestd: number | null;
		pricelist: number | null;
	}[];
	m_replenish: {
		m_warehouse_id: number;
		level_min: number;
		level_max: number;
		qtybatchsize: number;
	}[];
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
	qtyBatchSize: number | null;
	vendorPrices: { [vendorId: number]: number | null };
	vendorProductNos: { [vendorId: number]: string | null };
	action: boolean;
}

export interface ExportData {
	id?: number;
	sku: string;
	mpn?: string;
	name: string;
	quantity?: number;
	unitsperpack: number;
	taxRate: number;
	qtyWholesale: number;
	qtyRetail: number;
	levelMin: number;
	levelMax: number;
	qtyBatchSize: number;
	pricePurchase: number;
	ruc?: number;
	priceRetail: number;
	qtyTransfer?: number;
	newPrice?: number;
	[key: string]: string | number | undefined | null; // Allow null values for dynamic fields
}

export interface InternalTransferData {
	Šifra: string;
	name: string;
	unitsperpack: number;
	qtyWholesale: number;
	qtyRetail: number;
	levelMin: number;
	levelMax: number;
	qtyBatchSize: number;
	Količina?: number;
	'Pack Qty.': number;
	'Cena u obj.2'?: number;
}

export interface SalesActionData {
	Artikal: string;
	name: string;
	pricePurchase: number;
	priceRetail: number;
	'Cena bez PDV'?: number;
	'Cena sa PDV'?: number;
	[key: string]: string | number | undefined | null; // Allow dynamic vendor columns
}
