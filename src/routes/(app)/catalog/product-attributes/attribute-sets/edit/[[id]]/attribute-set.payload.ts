import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
import { mAttributesetInsertSchema, mAttributesetUpdateSchema } from '@tihomir971/assist-shared';

export const attributeSetPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributesetInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributesetUpdateSchema }
);
