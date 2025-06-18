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
	<Label for="discount_percent">Procenat popusta (%)</Label>
	<Input
		id="discount_percent"
		type="number"
		step="0.1"
		value={formula.discount_percent ?? ''}
		onchange={(e) => updateField('discount_percent', e.currentTarget.value)}
		placeholder="npr. 15 (za 15% popusta)"
	/>
	<p class="text-xs text-muted-foreground">
		Popust se primenjuje na osnovnu (maloprodajnu) cenu proizvoda.
	</p>
</div>
