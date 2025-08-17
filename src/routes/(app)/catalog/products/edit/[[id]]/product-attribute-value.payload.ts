import {
	mProductAttributeValueInsertSchema,
	mProductAttributeValueUpdateSchema
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const productAttributeValuePayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductAttributeValueInsertSchema },
	{ schema: mProductAttributeValueUpdateSchema }
);
