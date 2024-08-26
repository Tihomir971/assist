import { z } from 'zod';

export const productSchema = z.object({
	id: z.number(),
	sku: z.string().nullable(),
	barcode: z.string().nullable(),
	brand: z.string().nullable(),
	mpn: z.string().nullable(),
	name: z.string(),
	condition: z.string().nullable(),
	descriptionurl: z.string().nullable(),
	unitsperpack: z.number(),
	isactive: z.boolean(),
	isselfservice: z.boolean(),
	discontinued: z.boolean(),
	created: z.string(),
	updated: z.string(),
	c_uom_id: z.number(),
	m_product_category_id: z.number().nullable()
});

export type ProductSchema = z.infer<typeof productSchema>;

/* 	
	m_product_category_id: z.number().nullable(),
	 */
