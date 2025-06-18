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
	<Label for="markup_cost_value">Množilac nabavne cene</Label>
	<Input
		id="markup_cost_value"
		type="number"
		step="0.01"
		value={formula.value ?? ''}
		onchange={(e) => updateField('value', e.currentTarget.value)}
		placeholder="npr. 1.5 (za 50% marže)"
	/>
	<p class="text-xs text-muted-foreground">
		Prodajna cena = Nabavna cena × {formula.value ?? 'Množilac'}. Primer: 1.2 = 20% marža.
	</p>
</div>
