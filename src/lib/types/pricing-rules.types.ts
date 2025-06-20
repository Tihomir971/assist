export interface PricingRule {
	id: number;
	name: string;
	conditions: PricingConditions;
	formula: PricingFormula;
	priority: number;
	is_active: boolean;
	target_group?: string;
	starts_at?: string;
	ends_at?: string;
	created_at: string;
	updated_at: string;
}

export interface PricingConditions {
	partner_ids?: number[];
	product_ids?: number[];
	category_ids?: number[];
	brand_ids?: number[];
	attributes?: AttributeCondition[];
	min_quantity?: number;
	max_quantity?: number;
	min_order_value?: number;
}

export interface AttributeCondition {
	attribute_id: number;
	type: 'options' | 'number';

	// For options type: option IDs (works for both single and multi select)
	option_ids?: number[];

	// For number type: range conditions
	min_value?: number;
	max_value?: number;
	exact_value?: number;
}

export interface PricingFormula {
	type:
		| 'markup_cost'
		| 'fixed_price'
		| 'discount'
		| 'percentage_markup'
		| 'proportional_markup'
		| 'custom_script';

	// Standard formulas
	value?: number;
	discount_percent?: number;

	// Proportional markup with interpolation
	lower_bound?: number; // Lower cost boundary
	lower_markup?: number; // Markup percentage at/below lower bound
	upper_bound?: number; // Upper cost boundary
	upper_markup?: number; // Markup percentage at/above upper bound

	// Custom script for complex logic
	script?: string;
	variables?: Record<string, number>;

	// Price constraints
	min_price?: number;
	max_price?: number;
}

export interface PricingContext {
	product_id: number;
	partner_id?: number;
	quantity: number;
	order_value?: number;
	target_group?: string;
	base_price?: number;
	cost_price?: number;
	retail_price?: number;
}

export type PricingRuleCreate = Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>;
export type PricingRuleUpdate = Partial<PricingRuleCreate>;

// Database function response type
export interface PricingRuleMatch {
	id: number;
	name: string;
	conditions: PricingConditions;
	formula: PricingFormula;
	priority: number;
	target_group?: string;
}
