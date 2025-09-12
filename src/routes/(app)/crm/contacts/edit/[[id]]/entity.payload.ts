import { cBpartnerInsertSchema, cBpartnerUpdateSchema } from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const contactPayloadBuilder = new SmartPayloadBuilder(
	{ schema: cBpartnerInsertSchema, defaults: { is_active: true } },
	{ schema: cBpartnerUpdateSchema }
);
