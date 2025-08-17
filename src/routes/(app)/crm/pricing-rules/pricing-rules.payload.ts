import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';
import { pricingRulesInsertSchema, pricingRulesUpdateSchema } from '@tihomir971/assist-shared';
import type { PricingRulesInsert, PricingRulesUpdate } from '@tihomir971/assist-shared';

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
			formula: { type: 'percentage_markup', value: 20 }
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
						return { type: 'percentage_markup', value: 20 };
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
						return { type: 'percentage_markup', value: 20 };
					}
				}
				return value;
			}
		}
	}
);
