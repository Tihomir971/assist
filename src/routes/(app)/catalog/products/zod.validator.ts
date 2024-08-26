import { z } from 'zod';

export const crudProductGtinSchema = z.object({
	id: z.number().optional(),
	m_product_id: z.number(),
	gtin: z.string().refine((val) => is_valid_gtin(val), {
		message: 'Invalid GTIN format'
	}),
	isactive: z.boolean().default(true)
});

function is_valid_gtin(gtin: string): boolean {
	// Implement GTIN validation logic here
	// This is a simplified example, you may want to use a library or more complex validation
	return /^\d{8}$|^\d{12,14}$/.test(gtin);
}

export const replenishSchema = z.object({
	id: z.number().int().positive().optional(),
	created: z.date().optional(),
	updated: z.date().optional(),
	ad_client_id: z.number().int().positive().default(1),
	ad_org_id: z.number().int().positive().default(1),
	isactive: z.boolean().default(true),
	m_product_id: z.number().int().positive(),
	m_warehouse_id: z.number().int().positive(),
	level_min: z.number().int().nonnegative().default(0),
	level_max: z.number().int().nonnegative().default(0),
	m_warehousesource_id: z.number().int().positive().nullable(),
	m_replenish_uu: z.string().uuid().optional(),
	replenishtype: z.string().default('1'),
	m_locator_id: z.number().int().positive().nullable(),
	qtybatchsize: z.number().int().min(-32768).max(32767).nullable()
});
export const createReplenishSchema = replenishSchema.omit({
	id: true,
	created: true,
	updated: true,
	m_replenish_uu: true
});
export const updateReplenishSchema = replenishSchema.partial().omit({
	created: true,
	updated: true,
	m_replenish_uu: true
});
export const getReplenishSchema = z.object({
	id: z.number().int().positive()
});
export const deleteReplenishSchema = getReplenishSchema;
