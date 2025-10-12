import {
	docGeneratedDocumentInsertSchema,
	docGeneratedDocumentUpdateSchema
} from '$lib/types/zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const docGeneratedDocumentPayloadBuilder = new SmartPayloadBuilder(
	{ schema: docGeneratedDocumentInsertSchema },
	{ schema: docGeneratedDocumentUpdateSchema }
);
