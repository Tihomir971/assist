import { cBpartnerInsertSchema, cBpartnerUpdateSchema } from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const contactPayloadBuilder = new SmartPayloadBuilder(
	{ schema: cBpartnerInsertSchema, defaults: { is_active: true } },
	{ schema: cBpartnerUpdateSchema }
);
