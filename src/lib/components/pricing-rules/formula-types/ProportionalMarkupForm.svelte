<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PricingFormula } from '$lib/types/pricing-rules.types';

	interface Props {
		formula: Partial<PricingFormula>; // Use Partial as not all fields might be present initially
		onFormulaChange: (updates: Partial<PricingFormula>) => void;
	}

	let { formula, onFormulaChange }: Props = $props();

	// Helper to ensure values are numbers or undefined
	function toNumber(value: unknown): number | undefined {
		if (value === null || value === undefined || value === '') return undefined;
		const num = Number(value);
		return isNaN(num) ? undefined : num;
	}

	function updateField(field: keyof PricingFormula, value: unknown) {
		onFormulaChange({ [field]: toNumber(value) });
	}
</script>

<div class="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
	<div class="space-y-2">
		<Label for="lower_bound">Donja granica nabavne cene ($)</Label>
		<Input
			id="lower_bound"
			type="number"
			step="0.01"
			value={formula.lower_bound ?? ''}
			onchange={(e) => updateField('lower_bound', e.currentTarget.value)}
			placeholder="npr. 400"
		/>
		<p class="text-xs text-muted-foreground">Nabavna cena ispod koje se primenjuje donja marža.</p>
	</div>

	<div class="space-y-2">
		<Label for="lower_markup">Donja marža (%)</Label>
		<Input
			id="lower_markup"
			type="number"
			step="0.1"
			value={formula.lower_markup ?? ''}
			onchange={(e) => updateField('lower_markup', e.currentTarget.value)}
			placeholder="npr. 70"
		/>
		<p class="text-xs text-muted-foreground">
			Marža za proizvode čija je nabavna cena ispod donje granice.
		</p>
	</div>

	<div class="space-y-2">
		<Label for="upper_bound">Gornja granica nabavne cene ($)</Label>
		<Input
			id="upper_bound"
			type="number"
			step="0.01"
			value={formula.upper_bound ?? ''}
			onchange={(e) => updateField('upper_bound', e.currentTarget.value)}
			placeholder="npr. 2000"
		/>
		<p class="text-xs text-muted-foreground">Nabavna cena iznad koje se primenjuje gornja marža.</p>
	</div>

	<div class="space-y-2">
		<Label for="upper_markup">Gornja marža (%)</Label>
		<Input
			id="upper_markup"
			type="number"
			step="0.1"
			value={formula.upper_markup ?? ''}
			onchange={(e) => updateField('upper_markup', e.currentTarget.value)}
			placeholder="npr. 20"
		/>
		<p class="text-xs text-muted-foreground">
			Marža za proizvode čija je nabavna cena iznad gornje granice.
		</p>
	</div>

	<div class="space-y-2">
		<Label for="min_price">Minimalna prodajna cena ($) - opciono</Label>
		<Input
			id="min_price"
			type="number"
			step="0.01"
			value={formula.min_price ?? ''}
			onchange={(e) => updateField('min_price', e.currentTarget.value)}
			placeholder="npr. 599.99"
		/>
		<p class="text-xs text-muted-foreground">
			Ako je izračunata cena niža, koristiće se ova vrednost.
		</p>
	</div>

	<div class="space-y-2">
		<Label for="max_price">Maksimalna prodajna cena ($) - opciono</Label>
		<Input
			id="max_price"
			type="number"
			step="0.01"
			value={formula.max_price ?? ''}
			onchange={(e) => updateField('max_price', e.currentTarget.value)}
			placeholder="npr. 5000"
		/>
		<p class="text-xs text-muted-foreground">
			Ako je izračunata cena viša, koristiće se ova vrednost.
		</p>
	</div>
</div>

{#if formula.lower_bound !== undefined && formula.lower_markup !== undefined && formula.upper_bound !== undefined && formula.upper_markup !== undefined}
	<div class="mt-4 rounded-lg border bg-muted/50 p-3">
		<h4 class="mb-2 text-sm font-medium text-foreground">Primer kalkulacije:</h4>
		<div class="space-y-1 text-xs text-muted-foreground">
			<p>• Nabavna cena ≤ ${formula.lower_bound} → {formula.lower_markup}% marža</p>
			<p>
				• Nabavna cena između ${formula.lower_bound} i ${formula.upper_bound} → marža se proporcionalno
				menja između {formula.lower_markup}% i {formula.upper_markup}%
			</p>
			<p>• Nabavna cena ≥ ${formula.upper_bound} → {formula.upper_markup}% marža</p>
		</div>
	</div>
{/if}
