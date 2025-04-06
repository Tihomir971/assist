<script lang="ts">
	import { onMount } from 'svelte';
	import {
		MyCombobox,
		MyComboboxZag,
		MyCurrencyInput,
		MyDateInput,
		MyFileInput,
		MyNumberInput,
		MyTextInput,
		MyUrlInput
	} from '$lib/components/my/input';

	// Sample data for testing
	let textValue = $state('Sample text');
	let numberValue = $state(42.5);
	let dateValue = $state(new Date());
	let urlValue = $state('https://example.com');
	let currencyValue = $state(1250.75);

	// Combobox data
	type Fruit = { id: number; label: string };
	let selectedFruitId = $state<number | null>(null);
	let selectedFruitIdZag = $state<number | null>(null);
	const fruits = [
		{ value: 1, label: 'Apple' },
		{ value: 2, label: 'Banana' },
		{ value: 3, label: 'Orange' },
		{ value: 4, label: 'Strawberry' },
		{ value: 5, label: 'Blueberry' },
		{ value: 6, label: 'Mango' },
		{ value: 7, label: 'Pineapple' },
		{ value: 8, label: 'Watermelon' },
		{ value: 9, label: 'Peach' },
		{ value: 10, label: 'Grapes' },
		{ value: 11, label: 'Kiwi' },
		{ value: 12, label: 'Papaya' },
		{ value: 13, label: 'Cherry' },
		{ value: 14, label: 'Pear' },
		{ value: 15, label: 'Plum' },
		{ value: 16, label: 'Apricot' },
		{ value: 17, label: 'Avocado' },
		{ value: 18, label: 'Coconut' },
		{ value: 19, label: 'Fig' },
		{ value: 20, label: 'Date' }
	];

	// Error state examples
	let textError = $state('');
	let numberError = $state('');

	// Toggle error for demonstration
	function toggleTextError() {
		textError = textError ? '' : 'This is a sample error message';
	}

	function toggleNumberError() {
		numberError = numberError ? '' : 'Please enter a valid number';
	}

	// Log values on mount to verify initial state
	onMount(() => {
		console.log('Initial values:', {
			textValue,
			numberValue,
			dateValue,
			urlValue,
			currencyValue,
			selectedFruitId
		});
	});

	// Log combobox value changes
	$effect(() => {
		console.log('Selected fruit ID changed:', selectedFruitId);
	});

	$effect(() => {
		console.log('Selected fruit ID (Zag) changed:', selectedFruitIdZag);
	});

	// Log value changes
	$effect(() => {
		console.log('Text value changed:', textValue);
	});

	$effect(() => {
		console.log('Number value changed:', numberValue);
	});

	$effect(() => {
		console.log('Date value changed:', dateValue);
	});

	$effect(() => {
		console.log('URL value changed:', urlValue);
	});

	$effect(() => {
		console.log('Currency value changed:', currencyValue);
	});
</script>

<div class="container mx-auto max-w-3xl overflow-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Input Components Demo</h1>

	<div class="grid gap-6">
		<!-- Bits-UI Combobox Input -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">Bits-UI Combobox Input</h2>
			<div class="mb-2">
				<MyCombobox
					bind:value={selectedFruitId}
					items={fruits}
					placeholder="Select a fruit..."
					labelText="Fruit (Bits-UI)"
					inline
				/>
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1"
					onclick={() => {
						selectedFruitId = fruits[0].value;
					}}
				>
					Select Apple
				</button>
				<button
					class="rounded-md bg-secondary px-3 py-1"
					onclick={() => {
						selectedFruitId = null;
					}}
				>
					Clear
				</button>
			</div>
			<div class="mt-2">
				Current value: {selectedFruitId !== null
					? fruits.find((f) => f.value === selectedFruitId)?.label || 'None'
					: 'None'}
			</div>
		</div>

		<!-- Zag Combobox Input (Legacy) -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">Zag Combobox Input (Legacy)</h2>
			<div class="mb-2">
				<MyComboboxZag
					bind:value={selectedFruitIdZag}
					items={fruits}
					placeholder="Select a fruit..."
					labelText="Fruit (Zag)"
					inline
				/>
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1"
					onclick={() => {
						selectedFruitIdZag = fruits[0].value;
					}}
				>
					Select Apple
				</button>
				<button
					class="rounded-md bg-secondary px-3 py-1 text-secondary-foreground"
					onclick={() => {
						selectedFruitIdZag = null;
					}}
				>
					Clear
				</button>
			</div>
			<div class="mt-2">
				Current value: {selectedFruitIdZag !== null
					? fruits.find((f) => f.value === selectedFruitIdZag)?.label || 'None'
					: 'None'}
			</div>
		</div>

		<!-- Text Input -->
		<div class="card rounded-md border p-4">
			<div class="mb-2">
				<MyTextInput
					bind:value={textValue}
					placeholder="Enter text..."
					error={textError}
					labelText="Text Input"
					inline
				/>
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1"
					onclick={() => {
						textValue = 'Reset text';
					}}
				>
					Reset
				</button>
				<button
					class="rounded-md bg-secondary px-3 py-1 text-secondary-foreground"
					onclick={toggleTextError}
				>
					Toggle Error
				</button>
			</div>
			<div class="mt-2">Current value: {textValue}</div>
		</div>

		<!-- Number Input -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">Number Input</h2>
			<div class="mb-2">
				<MyNumberInput
					bind:value={numberValue}
					min={0}
					max={10000}
					step={0.5}
					error={numberError}
				/>
			</div>
			<div class="mt-2 text-sm text-muted-foreground">
				Note: Step value of 0.5 automatically sets precision to 1 decimal place and
				increments/decrements by 0.5
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1"
					onclick={() => {
						numberValue = 50;
					}}
				>
					Reset
				</button>
				<button
					class="rounded-md bg-secondary px-3 py-1 text-secondary-foreground"
					onclick={toggleNumberError}
				>
					Toggle Error
				</button>
			</div>
			<div class="mt-2">Current value: {numberValue}</div>
		</div>

		<!-- Date Input -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">Date Input</h2>
			<div class="mb-2">
				<MyDateInput bind:value={dateValue} locale="sr-Latn-RS" format="dd.MM.yyyy" />
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1"
					onclick={() => {
						dateValue = new Date();
					}}
				>
					Today
				</button>
			</div>
			<div class="mt-2">
				Current value: {dateValue instanceof Date ? dateValue.toISOString() : dateValue}
			</div>
		</div>

		<!-- URL Input -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">URL Input</h2>
			<div class="mb-2">
				<MyUrlInput bind:value={urlValue} placeholder="Enter URL..." />
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1"
					onclick={() => {
						urlValue = 'https://svelte.dev';
					}}
				>
					Svelte
				</button>
				<button
					class="rounded-md bg-secondary px-3 py-1 text-secondary-foreground"
					onclick={() => {
						urlValue = 'github.com';
					}}
				>
					GitHub (no protocol)
				</button>
			</div>
			<div class="mt-2">Current value: {urlValue}</div>
		</div>

		<!-- File Input -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">File Input</h2>
			<div class="mb-2">
				<MyFileInput accept="image/*" />
			</div>
			<div class="mt-2 text-sm text-muted-foreground">
				Note: File input doesn't use two-way binding as it's controlled by the browser.
			</div>
		</div>

		<!-- Currency Input -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">Currency Input</h2>
			<div class="mb-2">
				<MyCurrencyInput bind:value={currencyValue} currency="RSD" />
			</div>
			<div class="mt-2 text-sm text-muted-foreground">
				Note: Default step value of 0.01 automatically sets precision to 2 decimal places and
				increments/decrements by 0.01
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1"
					onclick={() => {
						currencyValue = 1000;
					}}
				>
					1000
				</button>
				<button
					class="rounded-md bg-secondary px-3 py-1 text-secondary-foreground"
					onclick={() => {
						currencyValue = 9999.99;
					}}
				>
					9999.99
				</button>
			</div>
			<div class="mt-2">Current value: {currencyValue}</div>
		</div>
	</div>
</div>
