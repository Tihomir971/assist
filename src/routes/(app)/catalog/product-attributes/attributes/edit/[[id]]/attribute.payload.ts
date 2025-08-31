import { mAttributeInsertSchema, mAttributeUpdateSchema } from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const attributePayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeUpdateSchema }
);
