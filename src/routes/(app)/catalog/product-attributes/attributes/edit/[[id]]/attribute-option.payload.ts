import {
	mAttributeOptionInsertSchema,
	mAttributeOptionUpdateSchema
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const attributeOptionPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeOptionInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeOptionUpdateSchema }
);
