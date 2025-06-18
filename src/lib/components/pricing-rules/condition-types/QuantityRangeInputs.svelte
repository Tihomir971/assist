<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PricingConditions } from '$lib/types/pricing-rules.types';

	type QuantityUpdates = Pick<
		PricingConditions,
		'min_quantity' | 'max_quantity' | 'min_order_value'
	>;

	interface Props {
		minQuantity?: number;
		maxQuantity?: number;
		minOrderValue?: number;
		onQuantityChange: (updates: QuantityUpdates) => void;
	}

	let {
		minQuantity = $bindable(),
		maxQuantity = $bindable(),
		minOrderValue = $bindable(),
		onQuantityChange
	}: Props = $props();

	function toNumber(value: unknown): number | undefined {
		if (value === null || value === undefined || value === '') return undefined;
		const num = Number(value);
		return isNaN(num) ? undefined : num;
	}

	function handleChange() {
		onQuantityChange({
			min_quantity: toNumber(minQuantity),
			max_quantity: toNumber(maxQuantity),
			min_order_value: toNumber(minOrderValue)
		});
	}
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
	<div class="space-y-2">
		<Label for="min_quantity">Minimalna količina</Label>
		<Input
			id="min_quantity"
			type="number"
			bind:value={minQuantity}
			oninput={handleChange}
			placeholder="npr. 10"
		/>
		<p class="text-xs text-muted-foreground">Minimalna količina proizvoda u narudžbi.</p>
	</div>
	<div class="space-y-2">
		<Label for="max_quantity">Maksimalna količina</Label>
		<Input
			id="max_quantity"
			type="number"
			bind:value={maxQuantity}
			oninput={handleChange}
			placeholder="npr. 100"
		/>
		<p class="text-xs text-muted-foreground">Maksimalna količina proizvoda u narudžbi.</p>
	</div>
	<div class="space-y-2">
		<Label for="min_order_value">Minimalna vrednost narudžbe ($)</Label>
		<Input
			id="min_order_value"
			type="number"
			step="0.01"
			bind:value={minOrderValue}
			oninput={handleChange}
			placeholder="npr. 500"
		/>
		<p class="text-xs text-muted-foreground">Minimalna ukupna vrednost narudžbe.</p>
	</div>
</div>
