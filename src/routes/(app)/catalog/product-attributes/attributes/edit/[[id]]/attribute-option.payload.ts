import {
	mAttributeOptionInsertSchema,
	mAttributeOptionUpdateSchema
} from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const attributeOptionPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeOptionInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeOptionUpdateSchema }
);
