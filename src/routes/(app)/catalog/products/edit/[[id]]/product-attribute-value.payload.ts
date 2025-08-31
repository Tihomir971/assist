import {
	mProductAttributeValueInsertSchema,
	mProductAttributeValueUpdateSchema
} from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const productAttributeValuePayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductAttributeValueInsertSchema },
	{ schema: mProductAttributeValueUpdateSchema }
);
