import {
	mAttributeGroupInsertSchema,
	mAttributeGroupUpdateSchema
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const attributeGroupPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeGroupInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeGroupUpdateSchema }
);
