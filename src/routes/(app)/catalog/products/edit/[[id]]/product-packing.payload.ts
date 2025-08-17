import {
	mProductPackingInsertSchema,
	mProductPackingUpdateSchema
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const productPackingPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductPackingInsertSchema },
	{ schema: mProductPackingUpdateSchema }
);
