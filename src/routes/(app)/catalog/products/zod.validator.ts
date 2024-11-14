import { z } from 'zod';
import { mReplenishRowSchema } from '$lib/types/supabase-zod-schemas';

export const productGtinSchema = z.object({
	id: z.number().optional(),
	m_product_id: z.number(),
	gtin: z.string().refine((val) => is_valid_gtin(val), {
		message: 'Invalid GTIN format'
	}),
	isactive: z.boolean().default(true)
});
export type ProductGtinSchema = z.infer<typeof productGtinSchema>;

export const schemaProductGtinID = z.object({
	id: productGtinSchema.shape.id
});
export type SchemaProductGtinID = z.infer<typeof schemaProductGtinID>;

function is_valid_gtin(gtin: string): boolean {
	// Implement GTIN validation logic here
	// This is a simplified example, you may want to use a library or more complex validation
	return /^\d{8}$|^\d{12,14}$/.test(gtin);
}

// Create new schema based on mReplenishRowSchema but omitting ad_client_id and ad_org_id
export const replenishSchema = mReplenishRowSchema.omit({
	ad_client_id: true,
	ad_org_id: true,
	isactive: true,
	created: true,
	updated: true,
	m_locator_id: true,
	m_replenish_uu: true,
	replenishtype: true
});
export type ReplenishSchema = z.infer<typeof replenishSchema>;

export const crudReplenishSchema = replenishSchema.extend({
	id: replenishSchema.shape.id.optional()
});
export type LoginSchema = typeof crudReplenishSchema;
export type CrudReplenishSchema = z.infer<typeof crudReplenishSchema>;
