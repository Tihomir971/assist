import { mPricelistInsertSchema, mPricelistUpdateSchema } from '@tihomir971/assist-shared';
import type { MPricelistInsert, MPricelistUpdate } from '@tihomir971/assist-shared';
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
