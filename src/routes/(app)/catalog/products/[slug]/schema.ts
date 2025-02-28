import { isValidGTIN } from '$lib/scripts/gtin';
import {
	mProductPackingInsertSchema,
	mProductPoInsertSchema,
	mProductPoRowSchema,
	mProductRowSchema,
	mReplenishRowSchema,
	mStorageonhandInsertSchema
} from '$lib/types/supabase/supabase-zod-schemas';
import { z } from 'zod';

// Product
export const crudMProductSchema = mProductRowSchema
	.extend({
		id: mProductRowSchema.shape.id.optional()
	})
	.omit({ created_at: true, updated_at: true })
	.passthrough();

export const crudMProductGtinSchema = z.object({
	productPacking: z.array(
		mProductPackingInsertSchema.passthrough().refine(
			(barcodes) => {
				return barcodes.gtin ? isValidGTIN(barcodes.gtin) : true;
			},
			{
				message: 'All GTINs must be valid (8, 12, 13, or 14 digits)'
			}
		)
	)
});
//export type CrudMProductGtinSchema = typeof crudMProductGtinSchema;
export type CrudMProductGtinSchema = z.infer<typeof crudMProductGtinSchema>;
// Create new schema based on mReplenishRowSchema but omitting ad_client_id and ad_org_id

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

export type CrudReplenishSchema = z.infer<typeof crudReplenishSchema>;

// Product PO

// First, define the individual purchase order row schema
const crudMProductPoRowSchema = mProductPoRowSchema
	.extend({
		id: mProductPoRowSchema.shape.id.optional(),
		is_active: mProductPoRowSchema.shape.is_active.optional(),
		c_currency_id: mProductPoRowSchema.shape.c_currency_id.optional(),
		c_uom_id: mProductPoRowSchema.shape.c_uom_id.optional(),
		discontinued: mProductPoRowSchema.shape.discontinued.optional(),
		manufacturer: mProductPoRowSchema.shape.manufacturer.optional(),
		valid_from: mProductPoRowSchema.shape.valid_from.optional(),
		valid_to: mProductPoRowSchema.shape.valid_to.optional(),
		pricelastinv: mProductPoRowSchema.shape.pricelastinv.optional(),
		pricelastpo: mProductPoRowSchema.shape.pricelastpo.optional(),
		pricepo: mProductPoRowSchema.shape.pricepo.optional(),
		vendorcategory: mProductPoRowSchema.shape.vendorcategory.optional()
	})
	.omit({ created_at: true, updated_at: true })
	.passthrough();

export const crudMProductPoSchema = z.object({
	purchases: z.array(crudMProductPoRowSchema)
});

export const mProductPoInsertSchemaАrray = z.object({
	purchases: z.array(mProductPoInsertSchema)
});
export type МProductPoInsertSchemaАrray = z.infer<typeof mProductPoInsertSchemaАrray>;
export type MProductPoInsertSchema = z.infer<typeof mProductPoInsertSchema>;

export const mStorageonhandInsertSchemaАrray = z.object({
	storageonhand: z.array(mStorageonhandInsertSchema)
});
export type MStorageonhandInsertSchemaАrray = z.infer<typeof mStorageonhandInsertSchemaАrray>;
