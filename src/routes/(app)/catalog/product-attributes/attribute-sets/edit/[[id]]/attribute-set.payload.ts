import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
import {
	mAttributesetInsertSchema,
	mAttributesetUpdateSchema
} from '$lib/types/supabase.zod.schemas';

export const attributeSetPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributesetInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributesetUpdateSchema }
);
