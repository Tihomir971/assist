import { z } from 'zod';

// Schema for AttributeCondition
export const attributeConditionSchema = z.object({
	attribute_id: z.number(),
	type: z.enum(['options', 'number']),
	option_ids: z.array(z.number()).optional(),
	min_value: z.number().optional(),
	max_value: z.number().optional(),
	exact_value: z.number().optional()
});

// Schema for PricingConditions
export const pricingConditionsSchema = z.object({
	partner_ids: z.array(z.number()).optional(),
	product_ids: z.array(z.number()).optional(),
	category_ids: z.array(z.number()).optional(),
	brand_ids: z.array(z.number()).optional(),
	attributes: z.array(attributeConditionSchema).optional(),
	min_quantity: z.number().optional(),
	max_quantity: z.number().optional(),
	min_order_value: z.number().optional()
});

// Schema for PricingFormula
export const pricingFormulaSchema = z.object({
	type: z.enum([
		'markup_cost',
		'fixed_price',
		'discount',
		'percentage_markup',
		'proportional_markup',
		'custom_script'
	]),
	value: z.number().optional(),
	discount_percent: z.number().optional(),
	lower_bound: z.number().optional(),
	lower_markup: z.number().optional(),
	upper_bound: z.number().optional(),
	upper_markup: z.number().optional(),
	script: z.string().optional(),
	variables: z.record(z.number()).optional(),
	min_price: z.number().optional(),
	max_price: z.number().optional()
});
