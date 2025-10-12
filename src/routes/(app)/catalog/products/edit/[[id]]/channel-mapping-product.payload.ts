import {
	cChannelMapProductInsertSchema,
	cChannelMapProductUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const channelMappingProductPayloadBuilder = new SmartPayloadBuilder(
	{ schema: cChannelMapProductInsertSchema },
	{ schema: cChannelMapProductUpdateSchema }
);
