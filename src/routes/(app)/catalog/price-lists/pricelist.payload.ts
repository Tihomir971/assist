import { mPricelistInsertSchema, mPricelistUpdateSchema } from '$lib/types/supabase.zod.schemas';
import type { MPricelistInsert, MPricelistUpdate } from '$lib/types/supabase.zod.types';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

// Pricelist Configuration
export const pricelistPayloadBuilder = new SmartPayloadBuilder<MPricelistInsert, MPricelistUpdate>(
	{
		schema: mPricelistInsertSchema,
		defaults: {
			is_active: false
		},
		transformers: {
			// Add any specific transformers for pricelist here if needed
		}
	},
	{
		schema: mPricelistUpdateSchema,
		transformers: {
			// Add any specific transformers for pricelist here if needed
		}
	}
);
