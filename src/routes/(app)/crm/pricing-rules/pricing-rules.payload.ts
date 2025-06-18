import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
import {
	pricingRulesInsertSchema,
	pricingRulesUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import type { PricingRulesInsert, PricingRulesUpdate } from '$lib/types/supabase.zod.schemas.d.js';

export const pricingRulesPayloadBuilder = new SmartPayloadBuilder<
	PricingRulesInsert,
	PricingRulesUpdate
>(
	{
		schema: pricingRulesInsertSchema,
		defaults: {
			is_active: true,
			priority: 0,
			conditions: {},
			formula: { type: 'markup_cost', value: 1.2 }
		},
		transformers: {
			conditions: (value) => {
				if (typeof value === 'string') {
					try {
						return JSON.parse(value);
					} catch {
						return {};
					}
				}
				return value || {};
			},
			formula: (value) => {
				if (typeof value === 'string') {
					try {
						return JSON.parse(value);
					} catch {
						return { type: 'markup_cost', value: 1.2 };
					}
				}
				return value;
			},
			priority: (value) => {
				const num = Number(value);
				return isNaN(num) ? 0 : num;
			}
		}
	},
	{
		schema: pricingRulesUpdateSchema,
		transformers: {
			conditions: (value) => {
				if (typeof value === 'string') {
					try {
						return JSON.parse(value);
					} catch {
						return {};
					}
				}
				return value;
			},
			formula: (value) => {
				if (typeof value === 'string') {
					try {
						return JSON.parse(value);
					} catch {
						return { type: 'markup_cost', value: 1.2 };
					}
				}
				return value;
			}
		}
	}
);
