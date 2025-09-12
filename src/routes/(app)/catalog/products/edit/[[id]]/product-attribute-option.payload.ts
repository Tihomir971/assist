import {
	mProductAttributeOptionInsertSchema,
	mProductAttributeOptionUpdateSchema
} from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productAttributeOptionPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductAttributeOptionInsertSchema },
	{ schema: mProductAttributeOptionUpdateSchema }
);
