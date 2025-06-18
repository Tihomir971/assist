<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PricingFormula } from '$lib/types/pricing-rules.types';

	interface Props {
		formula: Partial<PricingFormula>;
		onFormulaChange: (updates: Partial<PricingFormula>) => void;
	}

	let { formula, onFormulaChange }: Props = $props();

	function toNumber(value: unknown): number | undefined {
		if (value === null || value === undefined || value === '') return undefined;
		const num = Number(value);
		return isNaN(num) ? undefined : num;
	}

	function updateField(field: keyof PricingFormula, value: unknown) {
		onFormulaChange({ [field]: toNumber(value) });
	}
</script>

<div class="space-y-2">
	<Label for="percentage_markup_value">Procenat marže (%)</Label>
	<Input
		id="percentage_markup_value"
		type="number"
		step="0.1"
		value={formula.value ?? ''}
		onchange={(e) => updateField('value', e.currentTarget.value)}
		placeholder="npr. 25 (za 25% marže)"
	/>
	<p class="text-xs text-muted-foreground">
		Marža se dodaje na osnovnu (nabavnu ili maloprodajnu, zavisno od konteksta) cenu proizvoda.
	</p>
</div>
