<script lang="ts">
	import type { PricingFormula } from '$lib/types/pricing-rules.types';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';

	// Import formula type components - will be created in next steps
	import ProportionalMarkupForm from '../formula-types/ProportionalMarkupForm.svelte';
	import FixedPriceForm from '../formula-types/FixedPriceForm.svelte';
	import DiscountForm from '../formula-types/DiscountForm.svelte';
	import PercentageMarkupForm from '../formula-types/PercentageMarkupForm.svelte';
	import CustomScriptForm from '../formula-types/CustomScriptForm.svelte';

	interface Props {
		formula: PricingFormula;
		onFormulaChange: (formula: PricingFormula) => void;
	}

	let { formula, onFormulaChange }: Props = $props();

	const formulaTypes = [
		{ value: 'proportional_markup', label: 'Proporcionalna marža' },
		{ value: 'fixed_price', label: 'Fiksna cena' },
		{ value: 'discount', label: 'Popust (%)' },
		{ value: 'percentage_markup', label: 'Procenat marže (%)' },
		{ value: 'custom_script', label: 'Prilagođeni script' }
	];

	function handleTypeChange(newType: string | undefined) {
		if (!newType) return;

		// Reset formula with new type and default values or existing values if compatible
		let newFormulaBase: Partial<PricingFormula> = { type: newType as PricingFormula['type'] };

		switch (newType) {
			case 'proportional_markup':
				newFormulaBase = {
					...newFormulaBase,
					lower_bound: formula.lower_bound ?? 0,
					lower_markup: formula.lower_markup ?? 50,
					upper_bound: formula.upper_bound ?? 1000,
					upper_markup: formula.upper_markup ?? 20,
					min_price: formula.min_price,
					max_price: formula.max_price
				};
				break;
			case 'fixed_price':
				newFormulaBase = { ...newFormulaBase, value: formula.value ?? 0 };
				break;
			case 'discount':
				newFormulaBase = { ...newFormulaBase, discount_percent: formula.discount_percent ?? 0 };
				break;
			case 'percentage_markup':
				newFormulaBase = { ...newFormulaBase, value: formula.value ?? 0 };
				break;
			case 'custom_script':
				newFormulaBase = {
					...newFormulaBase,
					script: formula.script ?? '',
					variables: formula.variables ?? {}
				};
				break;
		}
		onFormulaChange(newFormulaBase as PricingFormula);
	}

	function handleFormulaUpdate(updates: Partial<PricingFormula>) {
		// Preserve the type, apply updates
		onFormulaChange({ ...formula, ...updates, type: formula.type } as PricingFormula);
	}

	const triggerContent = $derived(
		formulaTypes.find((f) => f.value === formula.type)?.label ?? 'Izaberite tip formule'
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Konfiguracija formule</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			<Label>Tip formule</Label>
			<Select.Root type="single" value={formula.type} onValueChange={(v) => handleTypeChange(v)}>
				<Select.Trigger class="w-full">
					{triggerContent}
				</Select.Trigger>
				<Select.Content>
					{#each formulaTypes as type (type.value)}
						<Select.Item value={type.value} label={type.label}>
							{type.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		{#if formula.type === 'proportional_markup'}
			<ProportionalMarkupForm {formula} onFormulaChange={handleFormulaUpdate} />
		{:else if formula.type === 'fixed_price'}
			<FixedPriceForm {formula} onFormulaChange={handleFormulaUpdate} />
		{:else if formula.type === 'discount'}
			<DiscountForm {formula} onFormulaChange={handleFormulaUpdate} />
		{:else if formula.type === 'percentage_markup'}
			<PercentageMarkupForm {formula} onFormulaChange={handleFormulaUpdate} />
		{:else if formula.type === 'custom_script'}
			<CustomScriptForm {formula} onFormulaChange={handleFormulaUpdate} />
		{/if}
	</Card.Content>
</Card.Root>
