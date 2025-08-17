import { mAttributeInsertSchema, mAttributeUpdateSchema } from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const attributePayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeUpdateSchema }
);
