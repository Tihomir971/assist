import { mProductPoInsertSchema, mProductPoUpdateSchema } from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productPoPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductPoInsertSchema },
	{ schema: mProductPoUpdateSchema }
);
