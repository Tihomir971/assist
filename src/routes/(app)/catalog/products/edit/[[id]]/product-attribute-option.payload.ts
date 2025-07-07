import {
	mProductAttributeOptionInsertSchema,
	mProductAttributeOptionUpdateSchema
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productAttributeOptionPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductAttributeOptionInsertSchema },
	{ schema: mProductAttributeOptionUpdateSchema }
);
