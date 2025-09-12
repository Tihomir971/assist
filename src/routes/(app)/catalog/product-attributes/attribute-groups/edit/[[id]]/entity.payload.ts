import {
	mAttributeGroupInsertSchema,
	mAttributeGroupUpdateSchema
} from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const attributeGroupPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mAttributeGroupInsertSchema, defaults: { is_active: true } },
	{ schema: mAttributeGroupUpdateSchema }
);
