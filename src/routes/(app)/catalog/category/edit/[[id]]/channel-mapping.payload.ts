import type {
	CChannelMapCategoryInsert,
	CChannelMapCategoryUpdate
} from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
import {
	cChannelMapCategoryInsertSchema,
	cChannelMapCategoryUpdateSchema
} from '@tihomir971/assist-shared';

export const channelMappingPayloadBuilder = new SmartPayloadBuilder<
	CChannelMapCategoryInsert,
	CChannelMapCategoryUpdate
>(
	{
		schema: cChannelMapCategoryInsertSchema,
		defaults: {
			is_active: false
		},
		transformers: {
			m_product_category_id: (value) => (value === '' || value === undefined ? null : Number(value))
		}
	},
	{
		schema: cChannelMapCategoryUpdateSchema,
		transformers: {
			m_product_category_id: (value) => (value === '' || value === undefined ? null : Number(value))
		}
	}
);
