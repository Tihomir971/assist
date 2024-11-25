import { z } from 'zod';
import { mReplenishRowSchema } from '$lib/types/supabase-zod-schemas';

// Create new schema based on mReplenishRowSchema but omitting ad_client_id and ad_org_id
export const replenishSchema = mReplenishRowSchema
	.omit({
		ad_client_id: true,
		ad_org_id: true,
		isactive: true,
		created: true,
		updated: true,
		m_locator_id: true,
		m_replenish_uu: true,
		replenishtype: true
	})
	.extend({
		id: mReplenishRowSchema.shape.id.optional()
	});
export type ReplenishSchema = z.infer<typeof replenishSchema>;

//export const crudReplenishSchema = replenishSchema.extend({
//	id: replenishSchema.shape.id.optional()
//});
export const crudReplenishSchema = z.object({
	replenishes: z.array(replenishSchema).refine(
		(replenishes) => {
			const uniqueKeys = new Set(
				replenishes.map((item) => JSON.stringify([item.m_product_id, item.m_warehouse_id]))
			);
			return uniqueKeys.size === replenishes.length;
		},
		{
			message: 'Warehouse must be a unique for product'
		}
	)
});

export type LoginSchema = typeof crudReplenishSchema;
export type CrudReplenishSchema = z.infer<typeof crudReplenishSchema>;
