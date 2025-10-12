import { mAttributeInsertSchema, mAttributeUpdateSchema } from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const attributePayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeUpdateSchema }
);
