import {
	cChannelMapProductInsertSchema,
	cChannelMapProductUpdateSchema
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const channelMappingProductPayloadBuilder = new SmartPayloadBuilder(
	{ schema: cChannelMapProductInsertSchema },
	{ schema: cChannelMapProductUpdateSchema }
);
