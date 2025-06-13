import { priceRulesInsertSchema, priceRulesUpdateSchema } from '$lib/types/supabase.zod.schemas';
import type { PriceRulesInsert, PriceRulesUpdate } from '$lib/types/supabase.zod.schemas-ts';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const priceRulesPayloadBuilder = new SmartPayloadBuilder<PriceRulesInsert, PriceRulesUpdate>(
	{
		schema: priceRulesInsertSchema,
		defaults: {
			is_active: false,
			priority: 0
		},
		transformers: {
			m_product_id: (value) => (value === '' || value === undefined ? null : Number(value)),
			m_attribute_id: (value) => (value === '' || value === undefined ? null : Number(value))
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
