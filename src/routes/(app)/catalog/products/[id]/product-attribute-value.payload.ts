import {
	mProductAttributeValueInsertSchema,
	mProductAttributeValueUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productAttributeValuePayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductAttributeValueInsertSchema },
	{ schema: mProductAttributeValueUpdateSchema }
);
