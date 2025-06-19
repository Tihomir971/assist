import {
	cChannelMapCategoryInsertSchema,
	cChannelMapCategoryUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import type {
	CChannelMapCategoryInsert,
	CChannelMapCategoryUpdate
} from '$lib/types/supabase.zod.schemas.d';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

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
