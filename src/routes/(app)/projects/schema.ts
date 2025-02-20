import { isValidGTIN } from '$lib/scripts/gtin';
import type { Tables } from '$lib/types/supabase/database.helper';
import { mProductPackingInsertSchema } from '$lib/types/supabase/supabase-zod-schemas';
import { z } from 'zod';
export const packingInsertSchema = mProductPackingInsertSchema.refine((data) => {
	return data.gtin ? isValidGTIN(data.gtin) : true;
});
export const packingSchema = z.object({
	id: z.number().optional(),
	m_product_id: z.number(),
	m_product_packing_type_id: z.number(),
	unitsperpack: z.number(),
	gtin: z
		.string()
		.nullable()
		.refine((gtin) => {
			return gtin ? isValidGTIN(gtin) : true;
		}),
	created_at: z.string().optional(),
	updated_at: z.string().optional()
});

export type PackingWithType = Tables<'m_product_packing'> & {
	packingType: Tables<'m_product_packing_type'> | null;
};
