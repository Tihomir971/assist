import {
	mProductCategoryInsertSchema,
	mProductCategoryUpdateSchema,
	cChannelMapCategoryInsertSchema,
	cChannelMapCategoryUpdateSchema,
	priceRulesInsertSchema,
	priceRulesUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import type {
	CChannelMapCategoryInsert,
	CChannelMapCategoryUpdate,
	MProductCategoryInsert,
	MProductCategoryUpdate,
	PriceRulesInsert,
	PriceRulesUpdate
} from '$lib/types/supabase.zod.schemas-ts';
import { SmartPayloadBuilder } from './smart-payload.builder';

// Category Configuration
export const categoryPayloadBuilder = new SmartPayloadBuilder<
	MProductCategoryInsert,
	MProductCategoryUpdate
>(
	{
		schema: mProductCategoryInsertSchema, // Zod schema for validation and shape
		defaults: {
			is_active: false,
			is_self_service: false
			// parent_id will be null by default if not provided and nullable
		},
		transformers: {
			// parent_id is already handled by autoTransform if it's a number schema
			// and form sends empty string for "no selection"
			parent_id: (value) => (value === '' || value === undefined ? null : Number(value))
		}
	},
	{
		schema: mProductCategoryUpdateSchema,
		transformers: {
			parent_id: (value) => (value === '' || value === undefined ? null : Number(value))
		}
	}
);

// Price Rules Configuration
export const priceRulesPayloadBuilder = new SmartPayloadBuilder<PriceRulesInsert, PriceRulesUpdate>(
	{
		schema: priceRulesInsertSchema,
		defaults: {
			is_active: false,
			priority: 0
		},
		transformers: {
			// m_product_id and m_attribute_id are often optional numbers
			m_product_id: (value) => (value === '' || value === undefined ? null : Number(value)),
			m_attribute_id: (value) => (value === '' || value === undefined ? null : Number(value))
			// price_formula_id and m_product_category_id should be handled by autoTransform
		}
	},
	{
		schema: priceRulesUpdateSchema,
		transformers: {
			m_product_id: (value) => (value === '' || value === undefined ? null : Number(value)),
			m_attribute_id: (value) => (value === '' || value === undefined ? null : Number(value))
		}
	}
);

// Channel Mapping Configuration
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
			// c_channel_id is required number, autoTransform should handle
			// resource_id and resource_name are required strings, autoTransform should handle
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
