import type { PricingContext, PricingRuleCreate } from '$lib/types/pricing-rules.types';
import { PricingRulesService } from './pricing-rules.service';

/**
 * Example usage of the PricingRulesService
 * This file demonstrates how to use the new pricing rules system
 */

// Example: Create a Samsung TV pricing rule
export const createSamsungTVRule = async (service: PricingRulesService): Promise<void> => {
	const rule: PricingRuleCreate = {
		name: 'Samsung TV Proportional Pricing',
		conditions: {
			category_ids: [1], // TV category
			attributes: [
				{
					attribute_id: 5, // Brand attribute
					type: 'options',
					option_ids: [25] // Samsung option
				},
				{
					attribute_id: 7, // Diagonal attribute
					type: 'options',
					option_ids: [50, 55, 65, 75] // 50", 55", 65", 75"
				}
			]
		},
		formula: {
			type: 'proportional_markup',
			lower_bound: 400,
			lower_markup: 70,
			upper_bound: 2000,
			upper_markup: 20,
			min_price: 599.99
		},
		priority: 1,
		is_active: true
	};

	await service.create(rule);
	console.log('Samsung TV pricing rule created');
};

// Example: Create a wholesale discount rule
export const createWholesaleRule = async (service: PricingRulesService): Promise<void> => {
	const rule: PricingRuleCreate = {
		name: 'Wholesale Discount',
		conditions: {
			min_quantity: 10
		},
		formula: {
			type: 'discount',
			discount_percent: 15
		},
		priority: 3,
		is_active: true,
		target_group: 'wholesale'
	};

	await service.create(rule);
	console.log('Wholesale discount rule created');
};

// Example: Calculate price for a Samsung 55" TV
export const calculateSamsungTVPrice = async (service: PricingRulesService): Promise<number> => {
	const context: PricingContext = {
		product_id: 123, // Samsung 55" TV product ID
		quantity: 1,
		cost_price: 800,
		retail_price: 1200,
		partner_id: 456
	};

	const price = await service.calculatePrice(context);
	console.log(`Calculated price for Samsung 55" TV: $${price}`);
	return price;
};

// Example: Get pricing breakdown for debugging
export const getPricingBreakdown = async (service: PricingRulesService): Promise<void> => {
	const context: PricingContext = {
		product_id: 123,
		quantity: 1,
		cost_price: 800,
		retail_price: 1200
	};

	const breakdown = await service.getPricingBreakdown(context);

	console.log('Pricing Breakdown:');
	console.log(`- Applicable rules: ${breakdown.applicableRules.length}`);
	console.log(`- Applied rule: ${breakdown.appliedRule?.name || 'None'}`);
	console.log(`- Final price: $${breakdown.finalPrice}`);

	if (breakdown.fallbackPrice) {
		console.log(`- Fallback price: $${breakdown.fallbackPrice}`);
	}
};

// Example: Test different cost prices with proportional markup
export const testProportionalMarkup = (): void => {
	const testCosts = [300, 400, 600, 800, 1200, 2000, 2500];

	console.log('Proportional Markup Test (Lower: $400@70%, Upper: $2000@20%):');
	console.log('Cost\t\tMarkup%\t\tPrice');
	console.log('----\t\t-------\t\t-----');

	testCosts.forEach((cost) => {
		let markup: number;

		if (cost <= 400) {
			markup = 70;
		} else if (cost >= 2000) {
			markup = 20;
		} else {
			// Proportional calculation
			const ratio = (cost - 400) / (2000 - 400);
			markup = 70 + (20 - 70) * ratio;
		}

		const price = cost * (1 + markup / 100);
		console.log(`$${cost}\t\t${markup.toFixed(1)}%\t\t$${price.toFixed(2)}`);
	});
};

// Example: Real-world usage in a SvelteKit route
export const exampleRouteUsage = `
// In your +page.server.ts file:
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';
import { supabase } from '$lib/server/supabase';

export const load = async ({ params }) => {
  const pricingService = new PricingRulesService(supabase);
  
  const context = {
    product_id: parseInt(params.productId),
    quantity: 1,
    cost_price: 500,
    partner_id: 123
  };
  
  const price = await pricingService.calculatePrice(context);
  const breakdown = await pricingService.getPricingBreakdown(context);
  
  return {
    price,
    breakdown
  };
};
`;

// Example: Usage in a Svelte component
export const exampleComponentUsage = `
<!-- In your Svelte component -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: ({ price, breakdown } = data);
</script>

<div class="pricing-info">
  <h2>Product Pricing</h2>
  <p class="price">Final Price: <strong>\${price}</strong></p>
  
  {#if breakdown.appliedRule}
    <div class="rule-info">
      <p>Applied Rule: {breakdown.appliedRule.name}</p>
      <p>Priority: {breakdown.appliedRule.priority}</p>
    </div>
  {/if}
  
  <details>
    <summary>Pricing Breakdown</summary>
    <ul>
      {#each breakdown.applicableRules as rule}
        <li>{rule.name} (Priority: {rule.priority})</li>
      {/each}
    </ul>
  </details>
</div>
`;
