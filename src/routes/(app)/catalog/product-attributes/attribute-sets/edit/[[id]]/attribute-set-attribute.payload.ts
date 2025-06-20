import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
import {
	mAttributesetAttributeInsertSchema,
	mAttributesetAttributeUpdateSchema
} from '$lib/types/supabase.zod.schemas';

export const attributeSetAttributePayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributesetAttributeInsertSchema, defaults: { is_active: true, is_required: false } },
	{ schema: mAttributesetAttributeUpdateSchema }
);
