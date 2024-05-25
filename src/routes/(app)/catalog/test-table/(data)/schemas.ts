import { z } from 'zod';

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const productSchema = z.object({
	id: z.number(),
	sku: z.string().nullable(),
	name: z.string(),
	barcode: z.string().nullable(),
	unitsperpack: z.number(),
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
			pricestd: z.number().nullable()
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

export type Product = z.infer<typeof productSchema>;
/* export type Product = {
	id: number;
	sku: string | null;
	name: string;
	barcode: string | null;
	unitsperpack: number;
	c_taxcategory: {
		c_tax: {
			rate: number;
		}[];
	} | null;
	m_storageonhand: {
		warehouse_id: number;
		qtyonhand: number;
	}[];
	priceList: {
		m_pricelist_version_id: number;
		pricestd: number | null;
	}[];
	level_min: {
		m_warehouse_id: number;
		level_min: number;
	}[];
	level_max: {
		m_warehouse_id: number;
		level_max: number;
	}[];
}; */

//export type Task = z.infer<typeof taskSchema>;
