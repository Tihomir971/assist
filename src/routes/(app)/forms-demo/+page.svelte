<script lang="ts">
	import {
		Combobox,
		EnhancedFormField,
		FormControl,
		type ComboboxOption
	} from '$lib/components/forms/index.js';

	// Sample options data
	const categories: ComboboxOption[] = [
		{ value: 1, label: 'Electronics' },
		{ value: 2, label: 'Clothing' },
		{ value: 3, label: 'Books' },
		{ value: 4, label: 'Home & Garden' },
		{ value: 5, label: 'Sports & Outdoors' }
	];

	// Standalone mode values
	let selectedCategory: number | undefined = $state(undefined);

	// Event handler for standalone mode
	function handleCategoryChange(value: number | null | undefined) {
		console.log('Category changed:', value);
	}
</script>

<div class="container mx-auto max-w-2xl p-8">
	<h1 class="mb-8 text-3xl font-bold">Forms Component Library Demo</h1>

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold">Unified Combobox Component</h2>
		<p class="mb-6 text-gray-600">
			Zag.js powered combobox that works both standalone and with superforms integration.
		</p>

		<div class="space-y-1.5">
			<Combobox
				bind:value={selectedCategory}
				options={categories}
				label="Select Category"
				placeholder="Choose category..."
				onValueChange={handleCategoryChange}
				required
			/>

			<Combobox
				options={categories}
				label="With Error State"
				placeholder="This shows error state..."
				errors={['This field is required']}
			/>

			<Combobox
				options={categories}
				label="Disabled Field"
				placeholder="This is disabled..."
				disabled={true}
			/>
		</div>

		<div class="bg-surface-1 mt-6 rounded-md p-4">
			<h3 class="mb-2 font-semibold">Selected Value:</h3>
			<div class="text-sm">
				Category ID: {JSON.stringify(selectedCategory)}
			</div>
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-2xl font-semibold">Features</h2>
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<h3 class="font-semibold">✅ Unified API</h3>
				<p class="text-sm text-gray-600">Works standalone and with superforms</p>
			</div>
			<div>
				<h3 class="font-semibold">✅ Real-time Search</h3>
				<p class="text-sm text-gray-600">Built-in filtering</p>
			</div>
			<div>
				<h3 class="font-semibold">✅ Numeric Values</h3>
				<p class="text-sm text-gray-600">Database ID friendly</p>
			</div>
			<div>
				<h3 class="font-semibold">✅ Accessible</h3>
				<p class="text-sm text-gray-600">Zag.js powered</p>
			</div>
		</div>
	</section>
</div>
