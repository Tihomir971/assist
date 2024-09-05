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
	replenishes: z
		.object({
			id: z.number().int().positive().optional(),
			created: z.string().optional(),
			updated: z.string().optional(),
			ad_client_id: z.number().int().positive().default(1).optional(),
			ad_org_id: z.number().int().positive().default(1).optional(),
			isactive: z.boolean().default(true).optional(),
			m_product_id: z.number().int().positive(),
			m_warehouse_id: z.number().int().positive(),
			level_min: z.number().int().nonnegative().default(0).optional(),
			level_max: z.number().int().nonnegative().default(0).optional(),
			m_warehousesource_id: z.number().int().positive().nullable().optional(),
			m_replenish_uu: z.string().uuid().nullable().optional(),
			replenishtype: z.string().optional().default('1').optional(),
			m_locator_id: z.number().positive().nullable().optional(),
			qtybatchsize: z.number().int().nonnegative().nullable().optional()
		})
		.array()
});
//export const replenishArraySchema = z.array(replenishSchema);
//export const crudReplenishSchema = replenishSchema.extend({
//	id: replenishSchema.shape.id.optional()
//});
