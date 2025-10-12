import { mReplenishInsertSchema, mReplenishUpdateSchema } from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const replenishPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mReplenishInsertSchema },
	{ schema: mReplenishUpdateSchema }
);
