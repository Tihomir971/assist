import {
	mAttributeOptionInsertSchema,
	mAttributeOptionUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const attributeOptionPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeOptionInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeOptionUpdateSchema }
);
