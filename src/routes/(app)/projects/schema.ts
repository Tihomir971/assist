import { isValidGTIN } from '$lib/scripts/gtin';
import {
	mProductPackingInsertSchema,
	mProductPackingUpdateSchema
} from '$lib/types/supabase/supabase-zod-schemas';

export const packingInsertSchema = mProductPackingInsertSchema.refine((data) => {
	return data.gtin ? isValidGTIN(data.gtin) : true;
});

export const packingUpdateSchema = mProductPackingUpdateSchema.refine((data) => {
	return data.gtin ? isValidGTIN(data.gtin) : true;
});
