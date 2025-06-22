import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';
import { pricingTestSchema } from './schema';
import type { PricingContext } from '$lib/types/pricing-rules.types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Initialize form with default values
	const form = await superValidate(zod(pricingTestSchema));

	// Load active pricing rules for display
	const pricingService = new PricingRulesService(supabase);
	const activeRules = await pricingService.list({ is_active: true });

	return {
		form,
		activeRules
	};
};

export const actions: Actions = {
	test: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(pricingTestSchema));
		console.log('form', form);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const pricingService = new PricingRulesService(supabase);

			// Create pricing context from form data
			const context: PricingContext = {
				product_id: form.data.product_id,
				partner_id: form.data.partner_id,
				quantity: form.data.quantity,
				order_value: form.data.order_value,
				target_group: form.data.target_group,
				input_price: form.data.input_price,
				vat_rate: form.data.apply_vat ? (form.data.vat_rate || 0) / 100 : 0
			};

			const options = {
				apply_vat: form.data.apply_vat,
				rounding_strategy: form.data.rounding_strategy
			};

			// Get detailed pricing breakdown
			const breakdown = await pricingService.getPricingBreakdown(context, options);

			// Test each applicable rule individually for detailed results
			const ruleTests = await Promise.all(
				breakdown.applicableRules.map(async (rule) => {
					const testResult = await pricingService.testRule(rule.id, context);
					return {
						rule,
						...testResult
					};
				})
			);

			return {
				form,
				success: true,
				results: {
					context,
					applicableRules: breakdown.applicableRules,
					calculatedPrice: breakdown.finalPrice,
					ruleTests,
					fallbackPrice: breakdown.fallbackPrice
				}
			};
		} catch (error) {
			console.error('Pricing test error:', error);
			return fail(500, {
				form,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			});
		}
	}
};
