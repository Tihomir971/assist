import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';
import { mAttributesetInsertSchema, mAttributesetUpdateSchema } from '$lib/types/supabase.schemas';

export const attributeSetPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributesetInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributesetUpdateSchema }
);
