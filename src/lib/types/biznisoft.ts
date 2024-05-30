export interface ArticlesOnStock {
	StorageID: number;
	ID: number;
	InvoicePrice: number;
	PurchasePrice: number;
	WholesalePrice: number;
	RetailPrice: number;
	Amount: number;
	POSSold: number;
	Reserved: number;
}

export interface BSArticle {
	sifra: number;
	naziv: string;
	grupa: number;
	grupaNaziv: string;
	jedmere: string;
	porez: string;
	katbr: null | string;
	jeusluga: number;
	garancija: number;
	tpbarkod: null | string;
	tpkolicina: null | string;
	ts: Date;
	jc_jedmere: string;
	jc_koef: number;
	serbrrok: number;
	barkod: null | string;
	barcodes: [string];
}
export interface BSNivoZaliha {
	sifra: number;
	sifobj: number;
	iminzal: number;
	imaxzal: number;
}
export interface BSProductInfo {
	sifra: number;
	naziv: string;
	grupa: number;
	grupaNaziv: string;
	jedmere: string;
	porez: string;
	katbr: string;
	jeusluga: number;
	garancija: number;
	tpbarkod?: string | null;
	tpkolicina: number;
	ts: Date;
	jc_jedmere: string;
	jc_koef: number;
	serbrrok: number;
	barkod: string;
	barcodes: (string | null)[];
}
