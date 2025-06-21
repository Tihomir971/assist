import { mProductInsertSchema, mProductUpdateSchema } from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const productPayloadBuilder = new SmartPayloadBuilder(
	{ schema: mProductInsertSchema },
	{ schema: mProductUpdateSchema }
);
