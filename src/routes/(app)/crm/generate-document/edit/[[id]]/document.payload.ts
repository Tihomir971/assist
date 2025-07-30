import {
	docGeneratedDocumentInsertSchema,
	docGeneratedDocumentUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const docGeneratedDocumentPayloadBuilder = new SmartPayloadBuilder(
	{ schema: docGeneratedDocumentInsertSchema },
	{ schema: docGeneratedDocumentUpdateSchema }
);
