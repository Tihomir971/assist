import { z } from 'zod';

export const mProductSchema = z.object({
	id: z.number().int().positive(),
	created: z.string().optional(),
	updated: z.string().optional(),
	name: z.string().min(1),
	sku: z.string().nullable(),
	attributes: z.any().nullable(),
	brand: z.string().nullable(),
	mpn: z.string().nullable(),
	condition: z.string().default('New').nullable(),
	m_attributeset_id: z.number().int().positive().default(1).nullable(),
	ad_client_id: z.number().int().positive().default(1),
	c_uom_id: z.number().int().positive().optional().default(2),
	unitsperpack: z.number().positive().optional().default(1),
	unitsperpallet: z.number().positive().nullable(),
	isselfservice: z.boolean().default(false),
	discontinued: z.boolean().optional().default(false),
	isactive: z.boolean().default(true),
	producttype: z.string().default('I'),
	c_taxcategory_id: z.number().int().positive().default(1),
	m_product_category_id: z.number().int().nullable(),
	ad_org_id: z.number().int().positive().default(1),
	featuredAssetId: z.number().int().positive().nullable(),
	imageurl: z.string().url().nullable(),
	descriptionurl: z.string().url().nullable(),
	m_product_uu: z.string().uuid().nullable(),
	net_quantity: z.number().optional(),
	net_qty_uom_id: z.number().nullable(),
	shelf_life: z.number().int().positive().nullable()
});
export type MProductSchema = z.infer<typeof mProductSchema>;
export const crudMProductSchema = mProductSchema.extend({
	id: mProductSchema.shape.id.optional()
});
export type CrudMProductSchema = typeof crudMProductSchema;
export const mProductBarcodesSchema = z.object({
	ad_org_id: z.number(),
	created: z.string(),
	gtin: z.string(),
	id: z.number(),
	isactive: z.boolean(),
	m_product_id: z.number(),
	updated: z.string()
});
