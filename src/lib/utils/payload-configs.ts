import type { PayloadBuilderConfig } from './form-payload.utils';
import type { Tables } from '$lib/types/supabase.types';

// Define Create types based on Supabase table definitions
type Category = Tables<'m_product_category'>;
export type CategoryCreate = Omit<Category, 'id' | 'created_at' | 'updated_at'>;

type PriceRule = Tables<'price_rules'>;
export type PriceRuleCreate = Omit<PriceRule, 'id' | 'created_at' | 'updated_at'>;

type ChannelMapping = Tables<'c_channel_map_category'>;
export type ChannelMappingCreate = Omit<ChannelMapping, 'id' | 'created_at' | 'updated_at'>;

// Category payload configuration
export const categoryPayloadConfig: PayloadBuilderConfig<CategoryCreate> = {
	requiredFields: ['name'],
	optionalFields: ['is_active', 'is_self_service', 'parent_id', 'description'],
	defaultValues: {
		is_active: false,
		is_self_service: false,
		parent_id: null,
		description: null
	},
	transformers: {
		parent_id: (value) =>
			value === undefined || value === '' || value === null || Number(value) === 0
				? null
				: Number(value),
		description: (value) => (value === undefined || value === '' ? null : value)
	}
};

// Price Rules payload configuration
export const priceRulesPayloadConfig: PayloadBuilderConfig<PriceRuleCreate> = {
	requiredFields: ['m_product_category_id', 'price_formula_id'],
	optionalFields: ['name', 'is_active', 'm_product_id', 'm_attribute_id', 'priority'],
	defaultValues: {
		name: null,
		is_active: false,
		m_product_id: null,
		m_attribute_id: null,
		priority: 0
	},
	transformers: {
		m_product_category_id: (value) => Number(value),
		price_formula_id: (value) => Number(value),
		m_product_id: (value) => (value === undefined || value === '' ? null : Number(value)),
		m_attribute_id: (value) => (value === undefined || value === '' ? null : Number(value)),
		priority: (value) => (value === undefined ? 0 : Number(value))
	}
};

// Channel Mapping payload configuration
export const channelMappingPayloadConfig: PayloadBuilderConfig<ChannelMappingCreate> = {
	requiredFields: ['c_channel_id', 'resource_id', 'resource_name'],
	optionalFields: ['is_active', 'm_product_category_id'],
	defaultValues: {
		is_active: false,
		m_product_category_id: null
	},
	transformers: {
		c_channel_id: (value) => Number(value),
		m_product_category_id: (value) => (value === undefined || value === '' ? null : Number(value))
	}
};
