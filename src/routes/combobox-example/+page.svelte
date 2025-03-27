<script lang="ts">
	import MyComboboxSelect from '$lib/components/my/MyComboboxSelect.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	import PhAirplane from '~icons/ph/airplane';

	// Example options with number values
	const options = [
		{ value: 1, label: 'Tihomir Jevtović' },
		{ value: 2, label: 'Jelena Natić' },
		{ value: 3, label: 'Stefan Trajković' },
		{ value: 4, label: 'Đorđe Milić' },
		{ value: 5, label: 'Vladimir Đorović' }
	];

	// Selected value (as string)
	let selectedValue = $state<string | undefined>(undefined);

	// Handle value change
	function handleValueChange(value: string) {
		console.log('Value changed:', value);
		// You can convert to number if needed
		const numValue = Number(value);
		console.log('As number:', numValue);
	}

	// Reset selection
	function resetSelection() {
		selectedValue = undefined;
	}
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-6 text-2xl font-bold">MyComboboxSelect Example</h1>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<div class="rounded-lg border p-4">
			<h2 class="mb-4 text-xl font-semibold">Basic Usage</h2>
			<MyComboboxSelect
				{options}
				bind:value={selectedValue}
				label="Select an option"
				placeholder="Search options..."
			/>
			<div class="mt-4">
				<p>Selected value: {selectedValue ?? 'None'}</p>
				<Button onclick={() => resetSelection()} class="mt-2">Reset</Button>
			</div>
		</div>

		<div class="rounded-lg border p-4">
			<h2 class="mb-4 text-xl font-semibold">With Custom Icon</h2>
			<MyComboboxSelect
				{options}
				onValueChange={handleValueChange}
				label="With custom icon"
				placeholder="Search options..."
				icon={PhAirplane}
			/>
			<div class="mt-4">
				<p>Check console for value change events</p>
			</div>
		</div>
	</div>
</div>
