import { mProductInsertSchema, mProductUpdateSchema } from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductInsertSchema },
	{ schema: mProductUpdateSchema }
);
