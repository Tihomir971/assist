import { mReplenishInsertSchema, mReplenishUpdateSchema } from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const replenishPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mReplenishInsertSchema },
	{ schema: mReplenishUpdateSchema }
);
