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

			// If base_price is not provided, default it to cost_price
			if (!form.data.base_price || form.data.base_price === 0) {
				form.data.base_price = form.data.cost_price;
			}

			// Create pricing context from form data
			const context: PricingContext = {
				product_id: form.data.product_id,
				partner_id: form.data.partner_id,
				quantity: form.data.quantity,
				order_value: form.data.order_value,
				target_group: form.data.target_group,
				base_price: form.data.base_price,
				cost_price: form.data.cost_price,
				retail_price: form.data.retail_price
			};

			// Find applicable rules
			const applicableRules = await pricingService.findApplicableRules(context);

			// Calculate final price
			const calculatedPrice = await pricingService.calculatePrice(context);

			// Test each rule individually for detailed results
			const ruleTests = await Promise.all(
				applicableRules.map(async (rule) => {
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
					applicableRules,
					calculatedPrice,
					ruleTests,
					fallbackPrice: context.base_price
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
