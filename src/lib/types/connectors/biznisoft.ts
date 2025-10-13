export interface BSProduct {
	sifra: number;
	naziv: string;
	grupa: number;
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
	barkod: string | null;
	barcodes: string[] | null;
	replenish: { sifobj: number; iminzal: number | null; imaxzal: number | null }[] | null;
	m_product_po: { kupac: number; kupsif: string }[] | null;
	trstanje:
		| {
				sifobj: number;
				nabcena: number;
				mpcena: number;
				stanje: number;
				neprokkasa: number;
				rezervacije: number;
		  }[]
		| null;
}
