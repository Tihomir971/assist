import { mPricelistInsertSchema, mPricelistUpdateSchema } from '$lib/types/supabase.schemas';
import type { MPricelistInsert, MPricelistUpdate } from '$lib/types/supabase.zod';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

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
