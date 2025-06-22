import type { Database, Json } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';
import {
	create,
	evaluateDependencies,
	smallerEqDependencies,
	addDependencies,
	subtractDependencies,
	multiplyDependencies,
	largerEqDependencies,
	divideDependencies,
	parseDependencies
} from 'mathjs/number';
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
	private evaluate: (expression: string, scope?: object) => number;

	constructor(private supabase: SupabaseClient<Database>) {
		const { evaluate } = create(
			{
				...evaluateDependencies,
				...addDependencies,
				...subtractDependencies,
				...multiplyDependencies,
				...divideDependencies,
				...parseDependencies,
				...smallerEqDependencies,
				...largerEqDependencies
			},
			{}
		);
		this.evaluate = (expression: string, scope?: object) => {
			const result = evaluate(expression, scope);
			if (typeof result !== 'number' || isNaN(result)) {
				throw new Error('Formula result is not a number');
			}
			return result;
		};
	}

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
	async calculatePrice(
		context: PricingContext,
		options?: {
			apply_vat?: boolean;
			rounding_strategy?: 'none' | 'charming';
		}
	): Promise<number> {
		// Get only matching rules from database
		const rules = await this.findApplicableRules(context);

		// Apply first rule (highest priority)
		for (const rule of rules) {
			try {
				return this.applyFormula(rule.formula, context, options);
			} catch (error) {
				console.warn(`Failed to apply pricing rule ${rule.id}:`, error);
				continue;
			}
		}

		// Fallback to base price, but still apply VAT and rounding if requested
		let fallbackPrice = context.input_price || 0;
		if (options?.apply_vat && context.vat_rate) {
			fallbackPrice *= 1 + context.vat_rate;
		}
		if (options?.rounding_strategy === 'charming') {
			fallbackPrice = this._applyCharmingRounding(fallbackPrice);
		}

		return fallbackPrice;
	}

	/**
	 * Apply pricing formula to calculate final price
	 */
	private applyFormula(
		formula: PricingFormula,
		context: PricingContext,
		options?: {
			apply_vat?: boolean;
			rounding_strategy?: 'none' | 'charming';
		}
	): number {
		let price: number;

		switch (formula.type) {
			case 'proportional_markup':
				price = this.applyProportionalMarkup(formula, context.input_price || 0);
				break;

			case 'fixed_price':
				price = formula.value || 0;
				break;

			case 'discount':
				price = (context.input_price || 0) * (1 - (formula.discount_percent || 0) / 100);
				break;

			case 'percentage_markup':
				price = (context.input_price || 0) * (1 + (formula.value || 0) / 100);
				break;

			case 'custom_script':
				price = this.evaluateCustomScript(formula, context);
				break;

			default:
				throw new Error(`Unknown formula type: ${formula.type}`);
		}

		// Apply price constraints
		if (formula.min_price !== undefined && price < formula.min_price) price = formula.min_price;
		if (formula.max_price !== undefined && price > formula.max_price) price = formula.max_price;

		// Apply optional VAT
		if (options?.apply_vat && context.vat_rate) {
			price *= 1 + context.vat_rate;
		}

		// Apply optional rounding
		if (options?.rounding_strategy === 'charming') {
			price = this._applyCharmingRounding(price);
		}

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
			input_price: context.input_price || 0,
			quantity: context.quantity || 1,
			lower_bound: formula.lower_bound || 0,
			lower_markup: formula.lower_markup || 0,
			upper_bound: formula.upper_bound || 0,
			upper_markup: formula.upper_markup || 0,
			...formula.variables
		};

		// Use local evaluate for safe evaluation
		return this.evaluate(formula.script, variables);
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
				// Note: testRule does not apply VAT or rounding, it shows the raw rule price.
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
	async getPricingBreakdown(
		context: PricingContext,
		options?: {
			apply_vat?: boolean;
			rounding_strategy?: 'none' | 'charming';
		}
	): Promise<{
		applicableRules: PricingRuleMatch[];
		appliedRule?: PricingRuleMatch;
		finalPrice: number;
		basePrice: number;
		fallbackPrice?: number;
	}> {
		const applicableRules = await this.findApplicableRules(context);
		let appliedRule: PricingRuleMatch | undefined;
		const basePrice = context.input_price || 0;
		let finalPrice = basePrice;

		if (applicableRules.length > 0) {
			appliedRule = applicableRules[0]; // Highest priority
			try {
				finalPrice = this.applyFormula(appliedRule.formula, context, options);
			} catch (error) {
				console.warn(`Failed to apply rule ${appliedRule.id}:`, error);
				appliedRule = undefined;
				// Recalculate final price with options if rule fails
				finalPrice = this.applyFormula({ type: 'fixed_price', value: basePrice }, context, options);
			}
		} else {
			// No rule applied, but still process options
			finalPrice = this.applyFormula({ type: 'fixed_price', value: basePrice }, context, options);
		}

		return {
			applicableRules,
			appliedRule,
			finalPrice,
			basePrice,
			fallbackPrice: appliedRule ? undefined : basePrice
		};
	}

	/**
	 * Applies "charming price" rounding logic using a rule-based system.
	 */
	private _applyCharmingRounding(price: number): number {
		interface RoundingRule {
			max: number;
			step: number;
			offset: number;
		}

		const roundingRules: RoundingRule[] = [
			{ max: 50, step: 1, offset: -0.01 },
			{ max: 100, step: 5, offset: -0.1 },
			{ max: 1000, step: 10, offset: -0.1 },
			{ max: 10000, step: 100, offset: -10 },
			{ max: Infinity, step: 1000, offset: -1 }
		];

		const rule = roundingRules.find((r) => price < r.max);
		if (!rule) {
			// This case should ideally not be reached if the last rule has max: Infinity
			return price;
		}

		const rounded = Math.ceil(price / rule.step) * rule.step;
		return Math.max(0, rounded + rule.offset);
	}
}
