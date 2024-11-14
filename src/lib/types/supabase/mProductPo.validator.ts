import { z } from 'zod';

export const mProductPoSchema = z.object({
	id: z.number().int(),
	created: z.string().optional(),
	updated: z.string().optional(),
	isactive: z.boolean().default(true),
	m_product_id: z.number().int(),
	c_bpartner_id: z.number().int(),
	iscurrentvendor: z.boolean().optional().default(true),
	c_uom_id: z.number().nullable().optional(),
	c_currency_id: z.number().nullable().optional(),
	pricelist: z.number(),
	pricepo: z.number().nullable().optional(),
	priceeffective: z.string().nullable().optional(),
	pricelastpo: z.number().nullable().optional(),
	pricelastinv: z.number().nullable().optional(),
	vendorproductno: z.string(),
	barcode: z.string().nullable().optional(),
	vendorcategory: z.string().nullable().optional(),
	discontinued: z.boolean().nullable().optional(),
	manufacturer: z.string().nullable().optional(),
	url: z.string().url().nullable().optional()
});

export const crudmProductPoSchema = mProductPoSchema.extend({
	id: mProductPoSchema.shape.id.optional()
});
export type CrudMProductPoSchema = typeof crudmProductPoSchema;
