import {
	mAttributesetAttributeInsertSchema,
	mAttributesetAttributeUpdateSchema
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const attributeSetAttributePayloadBuilder = new SmartPayloadBuilder(
	{
		schema: mAttributesetAttributeInsertSchema,
		defaults: { is_active: true, is_required: false, is_searchable: false }
	},
	{ schema: mAttributesetAttributeUpdateSchema }
);
