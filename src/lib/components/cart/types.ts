export type CartItem = {
	id: number;
	name: string;
	quantity: number;
	sku: string | null; // Added SKU property
};

export interface ExportData {
	SKU: string;
	MPN: string;
	Name: string;
	'Order Qty.': number;
	'Pack Qty.': number;
	Tax: number;
	'VP Qty.': number;
	'MP Qty.': number;
	'MP Max': number;
	'MP Batch': number;
	pricePurchase: number;
	priceRetail: number;
	'VP Max': number;
	'VP Batch': number;
	[vendorName: string]: number | string | null;
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
