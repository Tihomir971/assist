import { isValidGTIN } from '$lib/scripts/gtin';
import {
	mProductPackingInsertSchema,
	mProductPoInsertSchema as baseMProductPoInsertSchema, // Rename import
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
export type CrudMProductGtinSchema = z.infer<typeof crudMProductGtinSchema>;

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

// Schema for the form, extending the base insert schema with coercions
export const mProductPoFormSchema = baseMProductPoInsertSchema.extend({
	c_bpartner_id: z.coerce.number(),
	c_currency_id: z.coerce.number().optional().nullable(),
	c_uom_id: z.coerce.number().optional().nullable(),
	id: z.coerce.number().optional(),
	m_product_id: z.coerce.number(),
	pricelastinv: z.coerce.number().optional().nullable(),
	pricelastpo: z.coerce.number().optional().nullable(),
	pricelist: z.coerce.number().optional(),
	pricepo: z.coerce.number().optional().nullable()
});
export type MProductPoFormSchema = z.infer<typeof mProductPoFormSchema>;

export type MProductPoInsertSchema = z.infer<typeof baseMProductPoInsertSchema>; // Keep original type export

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

export const productPackingDeleteSchema = z.object({
	id: z.number()
});
