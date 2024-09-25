import { z } from 'zod';

export const productSelectSchema = z.object({
	ids: z.string(),
	source: z.number().default(2)
});
export type ProductSelectSchema = z.infer<typeof productSelectSchema>;

export const productSchema = z.object({
	id: z.number(),
	sku: z.string().nullable(),
	name: z.string(),
	mpn: z.string().nullable(),
	discontinued: z.boolean().default(false),
	unitsperpack: z.number(),
	imageurl: z.string().nullable(),
	c_taxcategory: z
		.object({
			c_tax: z.array(z.object({ rate: z.number() }))
		})
		.nullable(),
	m_storageonhand: z.array(
		z.object({
			warehouse_id: z.number(),
			qtyonhand: z.number()
		})
	),
	priceList: z.array(
		z.object({
			m_pricelist_version_id: z.number(),
			pricestd: z.number().nullable(),
			pricelist: z.number().nullable()
		})
	),
	m_product_po: z.array(
		z.object({
			c_bpartner_id: z.number(),
			pricelist: z.number().nullable()
		})
	),
	level_min: z.array(
		z.object({
			m_warehouse_id: z.number(),
			level_min: z.number()
		})
	),
	level_max: z.array(
		z.object({
			m_warehouse_id: z.number(),
			level_max: z.number()
		})
	)
});
export type ProductSchema = z.infer<typeof productSchema>;

export const partnerSchema = z.object({
	sifra: z.number().positive(),
	naziv: z.string(),
	pbr: z.string().length(5).nullable(),
	mesto: z.string().nullable(),
	adresa: z.string().nullable(),
	konosoba: z.string().nullable(),
	telefoni: z.string().nullable(),
	drzava: z.string().nullable(),
	pib: z.string().nullable(),
	matbr: z.string().nullable(),
	pdv: z.number().positive(),
	email: z.string().email({ message: 'Invalid email address' }).nullable(),
	tip: z.number().positive(),
	punnaziv: z.string().nullable()
});
export type PartnerSchema = z.infer<typeof partnerSchema>;

export const shoppingCartSchema = z.object({
	id: z.number().positive(),
	product: z.object({
		id: z.number().positive(),
		name: z.string(),
		imageurl: z.string().nullable(),
		price: z.number().positive(),
		quantity: z.number().positive()
	})
});
export type ShoppingCartSchema = z.infer<typeof shoppingCartSchema>;
