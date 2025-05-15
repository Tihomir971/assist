import { isValidGTIN } from '$lib/scripts/gtin';
import {
	mProductPackingInsertSchema,
	mReplenishRowSchema,
	mStorageonhandInsertSchema
} from '$lib/types/supabase.zod.schemas';
import { z } from 'zod';

// Replenish
export const replenishSchema = mReplenishRowSchema
	.omit({
		is_active: true,
		created_at: true,
		updated_at: true,
		m_locator_id: true,
		m_replenish_uu: true,
		replenishtype: true
	})
	.extend({
		id: mReplenishRowSchema.shape.id.optional()
	});

export const mStorageonhandInsertSchemaАrray = z.object({
	storageonhand: z.array(mStorageonhandInsertSchema)
});
export type MStorageonhandInsertSchemaАrray = z.infer<typeof mStorageonhandInsertSchemaАrray>;

// Product Packing
// First, define the individual packing row schema
export const productPackingInsertSchema = mProductPackingInsertSchema
	.extend({ is_display: mProductPackingInsertSchema.shape.is_display.default(false) })
	.refine((data) => {
		return data.gtin ? isValidGTIN(data.gtin) : true;
	});
export type ProductPackingInsertSchema = z.infer<typeof productPackingInsertSchema>;

export const deleteByIdSchema = z.object({
	id: z.number()
});
