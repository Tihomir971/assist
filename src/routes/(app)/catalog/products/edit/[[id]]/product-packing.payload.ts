import {
	mProductPackingInsertSchema,
	mProductPackingUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productPackingPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductPackingInsertSchema },
	{ schema: mProductPackingUpdateSchema }
);
