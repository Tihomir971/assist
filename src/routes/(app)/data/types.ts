import { z } from 'zod';

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

const partnerBS = z.object({
	sifra: z.number(),
	naziv: z.string(),
	pbr: z.string().nullable(),
	mesto: z.string().nullable(),
	adresa: z.string().nullable(),
	konosoba: z.string().nullable(),
	telefoni: z.string().nullable(),
	drzava: z.string().nullable(),
	pib: z.string().nullable(),
	matbr: z.string().nullable(),
	pdv: z.number(),
	tip: z.number(),
	email: z.string().nullable(),
	punnaziv: z.string().nullable(),
	aktivan: z.number()
});
export type PartnerBS = z.infer<typeof partnerBS>;

const groupBS = z.object({
	sifra: z.number(),
	naziv: z.string()
});
export type GroupBS = z.infer<typeof groupBS>;
