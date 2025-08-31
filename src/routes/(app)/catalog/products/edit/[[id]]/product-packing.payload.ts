import {
	mProductPackingInsertSchema,
	mProductPackingUpdateSchema
} from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const productPackingPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductPackingInsertSchema },
	{ schema: mProductPackingUpdateSchema }
);
