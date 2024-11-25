import { mProductGtinRowSchema, mProductRowSchema } from '$lib/types/supabase-zod-schemas';
import { z } from 'zod';

function is_valid_gtin(gtin: string): boolean {
	return /^\d{8}$|^\d{12,14}$/.test(gtin);
}

export const crudMProductSchema = mProductRowSchema
	.extend({
		id: mProductRowSchema.shape.id.optional()
	})
	.omit({ created: true, updated: true })
	.passthrough();
export type CrudMProductSchema = typeof crudMProductSchema;

export const crudMProductGtinSchema = z.object({
	barcodes: z.array(
		mProductGtinRowSchema
			.extend({
				id: mProductRowSchema.shape.id.optional(),
				isactive: mProductRowSchema.shape.isactive.optional()
			})
			.omit({ created: true, updated: true })
			.passthrough()
			.refine(
				(barcodes) => {
					return is_valid_gtin(barcodes.gtin);
				},
				{
					message: 'All GTINs must be valid (8, 12, 13, or 14 digits)'
				}
			)
	)
});
export type CrudMProductGtinSchema = typeof crudMProductGtinSchema;
