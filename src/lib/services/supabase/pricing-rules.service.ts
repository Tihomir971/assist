import type { Database, Json } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';
import { PriceCalculator } from '$lib/price-calculator';
import type {
	PricingRule,
	PricingRuleCreate,
	PricingRuleUpdate,
	PricingContext,
	PricingFormula,
	PricingRuleMatch
} from '$lib/types/pricing-rules.types';

export class PricingRulesService
	implements CRUDService<PricingRule, PricingRuleCreate, PricingRuleUpdate>
{
	private priceCalculator = new PriceCalculator();

	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<PricingRule | null> {
		const { data, error } = await this.supabase
			.from('pricing_rules')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch pricing rule: ${error.message}`);
		return data as PricingRule | null;
	}

	async create(data: PricingRuleCreate): Promise<PricingRule> {
		const insertData = {
			name: data.name,
			conditions: data.conditions as unknown as Json,
			formula: data.formula as unknown as Json,
			priority: data.priority,
			is_active: data.is_active,
			target_group: data.target_group,
			starts_at: data.starts_at,
			ends_at: data.ends_at
		};

		const { data: newRule, error } = await this.supabase
			.from('pricing_rules')
			.insert(insertData)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create pricing rule: ${error.message}`);
		if (!newRule) throw new Error('Failed to create pricing rule: No data returned');
		return newRule as unknown as PricingRule;
	}

	async update(id: number, data: PricingRuleUpdate): Promise<PricingRule> {
		const updateData: Record<string, Json | string | number | boolean | null> = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.conditions !== undefined) updateData.conditions = data.conditions as unknown as Json;
		if (data.formula !== undefined) updateData.formula = data.formula as unknown as Json;
		if (data.priority !== undefined) updateData.priority = data.priority;
		if (data.is_active !== undefined) updateData.is_active = data.is_active;
		if (data.target_group !== undefined) updateData.target_group = data.target_group;
		if (data.starts_at !== undefined) updateData.starts_at = data.starts_at;
		if (data.ends_at !== undefined) updateData.ends_at = data.ends_at;

		const { data: updatedRule, error } = await this.supabase
			.from('pricing_rules')
			.update(updateData)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update pricing rule: ${error.message}`);
		if (!updatedRule) throw new Error('Failed to update pricing rule: No data returned');
		return updatedRule as unknown as PricingRule;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('pricing_rules').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete pricing rule: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<PricingRule[]> {
		let query = this.supabase.from('pricing_rules').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		if (filters?.target_group) {
			query = query.eq('target_group', filters.target_group as string);
		}

		const { data, error } = await query.order('priority', { ascending: true });
		if (error) throw new Error(`Failed to list pricing rules: ${error.message}`);
		return (data || []) as unknown as PricingRule[];
	}

	/**
	 * Find applicable pricing rules using database function
	 */
	async findApplicableRules(context: PricingContext): Promise<PricingRuleMatch[]> {
		const { data, error } = await this.supabase.rpc('find_applicable_pricing_rules', {
			p_product_id: context.product_id,
			p_partner_id: context.partner_id ?? undefined,
			p_quantity: context.quantity,
			p_order_value: context.order_value ?? undefined,
			p_target_group: context.target_group ?? undefined
		});

		if (error) throw new Error(`Failed to find applicable pricing rules: ${error.message}`);
		return (data || []) as unknown as PricingRuleMatch[];
	}

	/**
	 * Calculate price using applicable rules
	 */
	async calculatePrice(context: PricingContext): Promise<number> {
		// Get only matching rules from database
		const rules = await this.findApplicableRules(context);

		// Apply first rule (highest priority)
		for (const rule of rules) {
			try {
				return this.applyFormula(rule.formula, context);
			} catch (error) {
				console.warn(`Failed to apply pricing rule ${rule.id}:`, error);
				continue;
			}
		}

		// Fallback to base price
		return context.base_price || 0;
	}

	/**
	 * Apply pricing formula to calculate final price
	 */
	private applyFormula(formula: PricingFormula, context: PricingContext): number {
		let price: number;

		switch (formula.type) {
			case 'proportional_markup':
				price = this.applyProportionalMarkup(formula, context.cost_price || 0);
				break;

			case 'fixed_price':
				price = formula.value || 0;
				break;

			case 'discount':
				price = (context.retail_price || 0) * (1 - (formula.discount_percent || 0) / 100);
				break;

			case 'percentage_markup':
				price = (context.base_price || 0) * (1 + (formula.value || 0) / 100);
				break;

			case 'custom_script':
				price = this.evaluateCustomScript(formula, context);
				break;

			default:
				throw new Error(`Unknown formula type: ${formula.type}`);
		}

		// Apply price constraints
		if (formula.min_price && price < formula.min_price) price = formula.min_price;
		if (formula.max_price && price > formula.max_price) price = formula.max_price;

		return price;
	}

	/**
	 * Apply proportional markup between bounds
	 */
	private applyProportionalMarkup(formula: PricingFormula, costPrice: number): number {
		const { lower_bound, lower_markup, upper_bound, upper_markup } = formula;

		// Validate required parameters
		if (
			lower_bound === undefined ||
			lower_markup === undefined ||
			upper_bound === undefined ||
			upper_markup === undefined
		) {
			throw new Error(
				'Proportional markup requires lower_bound, lower_markup, upper_bound, and upper_markup'
			);
		}

		let markupPercent: number;

		if (costPrice <= lower_bound) {
			// At or below lower bound - use lower markup
			markupPercent = lower_markup;
		} else if (costPrice >= upper_bound) {
			// At or above upper bound - use upper markup
			markupPercent = upper_markup;
		} else {
			// Between bounds - calculate proportional markup
			const ratio = (costPrice - lower_bound) / (upper_bound - lower_bound);
			markupPercent = lower_markup + (upper_markup - lower_markup) * ratio;
		}

		return costPrice * (1 + markupPercent / 100);
	}

	/**
	 * Evaluate custom script formula
	 */
	private evaluateCustomScript(formula: PricingFormula, context: PricingContext): number {
		if (!formula.script) throw new Error('Custom script formula requires script');

		const variables = {
			cost_price: context.cost_price || 0,
			base_price: context.base_price || 0,
			retail_price: context.retail_price || 0,
			quantity: context.quantity || 1,
			lower_bound: formula.lower_bound || 0,
			lower_markup: formula.lower_markup || 0,
			upper_bound: formula.upper_bound || 0,
			upper_markup: formula.upper_markup || 0,
			...formula.variables
		};

		// Use existing PriceCalculator for safe evaluation
		return this.priceCalculator.calculate(formula.script, 0, variables.cost_price);
	}

	/**
	 * Test a pricing rule against a context without applying it
	 */
	async testRule(
		ruleId: number,
		context: PricingContext
	): Promise<{ matches: boolean; price?: number; error?: string }> {
		try {
			const rule = await this.getById(ruleId);
			if (!rule) {
				return { matches: false, error: 'Rule not found' };
			}

			const applicableRules = await this.findApplicableRules(context);
			const matches = applicableRules.some((r) => r.id === ruleId);

			if (matches) {
				const price = this.applyFormula(rule.formula, context);
				return { matches: true, price };
			} else {
				return { matches: false };
			}
		} catch (error) {
			return { matches: false, error: error instanceof Error ? error.message : 'Unknown error' };
		}
	}

	/**
	 * Get pricing breakdown for debugging
	 */
	async getPricingBreakdown(context: PricingContext): Promise<{
		applicableRules: PricingRuleMatch[];
		appliedRule?: PricingRuleMatch;
		finalPrice: number;
		fallbackPrice?: number;
	}> {
		const applicableRules = await this.findApplicableRules(context);
		let appliedRule: PricingRuleMatch | undefined;
		let finalPrice = context.base_price || 0;

		if (applicableRules.length > 0) {
			appliedRule = applicableRules[0]; // Highest priority
			try {
				finalPrice = this.applyFormula(appliedRule.formula, context);
			} catch (error) {
				console.warn(`Failed to apply rule ${appliedRule.id}:`, error);
				appliedRule = undefined;
			}
		}

		return {
			applicableRules,
			appliedRule,
			finalPrice,
			fallbackPrice: appliedRule ? undefined : context.base_price
		};
	}
}
