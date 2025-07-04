import { mProductPoInsertSchema, mProductPoUpdateSchema } from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productPoPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductPoInsertSchema },
	{ schema: mProductPoUpdateSchema }
);
