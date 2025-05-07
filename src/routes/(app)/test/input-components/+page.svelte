<script lang="ts">
	import { onMount } from 'svelte';
	import {
		MyCurrencyInput,
		MyDateInput,
		MyFileInput,
		MyTextInput,
		MyUrlInput
	} from '$lib/components/my/input';
	import { ComboboxZag } from '$lib/components/zag/index.js';

	import { Button } from '$lib/components/ui/button/index.js';
	import { MySelectMelt } from '$lib/components/my';
	// Note: The tab IDs here ('tab1', 'tab2') must match the snippet names below
	// Sample data for testing
	let textValue = $state('Sample text');
	let numberValue = $state(42.5);
	let dateValue = $state(new Date());
	let urlValue = $state('https://example.com');
	let currencyValue = $state(1250.75);

	// Combobox data
	type Fruit = { id: number; label: string };
	let selectedFruitId = $state<string | null>(null);
	let selectedFruitIdZag = $state<number | null>();
	let selectedFruitIdShad = $state<string | null>();

	const fruitsNum = [
		{ value: 1, label: 'Apple' },
		{ value: 2, label: 'Banana' },
		{ value: 3, label: 'Orange' },
		{ value: 4, label: 'Strawberry' },
		{ value: 5, label: 'Blueberry' },
		{ value: 6, label: 'Mango' },
		{ value: 7, label: 'Pineapple' },
		{ value: 8, label: 'Watermelon' },
		{ value: 9, label: 'Peach' },
		{ value: 10, label: 'Grapes' }
	];
	const fruitsStr = [
		{ value: '1', label: 'Apple' },
		{ value: '2', label: 'Banana' },
		{ value: '3', label: 'Orange' },
		{ value: '4', label: 'Strawberry' },
		{ value: '5', label: 'Blueberry' },
		{ value: '6', label: 'Mango' },
		{ value: '7', label: 'Pineapple' },
		{ value: '8', label: 'Watermelon' },
		{ value: '9', label: 'Peach' },
		{ value: '10', label: 'Grapes' }
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
	$inspect('Selected fruit ID changed:', selectedFruitId);

	$inspect('Selected fruit ID (Zag) changed:', selectedFruitIdZag);

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

<div class="container mx-auto overflow-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Input Components Demo</h1>

	<div
		class="grid grid-cols-3 gap-6 *:grid *:gap-2 *:rounded-md *:border *:border-surface-2 *:bg-surface-1 *:p-4 *:shadow-3"
	>
		<!-- Zag Combobox Input (Legacy) -->
		<div class="card rounded-md border p-4">
			<ComboboxZag bind:value={selectedFruitIdZag} items={fruitsNum} />
			{selectedFruitIdZag}
			<div class="flex gap-2">
				<Button
					onclick={() => {
						selectedFruitIdZag = fruitsNum[0].value;
					}}
				>
					Select Apple
				</Button>
				<Button
					variant="destructive"
					onclick={() => {
						selectedFruitIdZag = null;
					}}
				>
					Clear
				</Button>
			</div>
			<div>
				Current value: {selectedFruitIdZag !== null
					? fruitsNum.find((f) => f.value === selectedFruitIdZag)?.label || 'None'
					: 'None'}
			</div>
		</div>
		<div class="card rounded-md border p-4">
			{selectedFruitIdShad}
			<div class="flex gap-2">
				<Button
					onclick={() => {
						selectedFruitIdShad = fruitsStr[0].value;
					}}
				>
					Select Apple
				</Button>
				<Button
					variant="destructive"
					onclick={() => {
						selectedFruitIdShad = null;
					}}
				>
					Clear
				</Button>
			</div>
			<div>
				Current value: {selectedFruitIdZag !== null
					? fruitsStr.find((f) => f.value === selectedFruitIdShad)?.label || 'None'
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
				<Button
					variant="default"
					onclick={() => {
						textValue = 'Reset text';
					}}
				>
					Reset
				</Button>
				<Button variant="destructive" onclick={toggleTextError}>Toggle Error</Button>
			</div>
			<div>Current value: {textValue}</div>
		</div>

		<!-- Date Input -->
		<div class="card rounded-md border p-4">
			<MyDateInput
				bind:value={dateValue}
				locale="sr-Latn-RS"
				format="dd.MM.yyyy"
				labelText="Date Input"
			/>
			<div class="flex gap-2">
				<Button
					variant="default"
					onclick={() => {
						dateValue = new Date();
					}}
				>
					Today
				</Button>
			</div>
			<div>
				Current value: {dateValue instanceof Date ? dateValue.toISOString() : dateValue}
			</div>
		</div>

		<!-- URL Input -->
		<div>
			<MyUrlInput bind:value={urlValue} placeholder="Enter URL..." labelText="URL Input" />
			<div class="flex gap-2">
				<Button
					variant="outline"
					onclick={() => {
						urlValue = 'https://svelte.dev';
					}}
				>
					Svelte
				</Button>
				<Button
					variant="outline"
					onclick={() => {
						urlValue = 'github.com';
					}}
				>
					GitHub (no protocol)
				</Button>
			</div>
			<div>Current value: {urlValue}</div>
		</div>

		<!-- File Input -->
		<div>
			<MyFileInput accept="image/*" labelText="File Input" />
			<div class="text-sm text-muted-foreground">
				Note: File input doesn't use two-way binding as it's controlled by the browser.
			</div>
		</div>

		<!-- Currency Input -->
		<div>
			<MyCurrencyInput bind:value={currencyValue} currency="RSD" labelText="Currency Input" />
			<div class="mt-2 text-sm text-muted-foreground">
				Note: Default step value of 0.01 automatically sets precision to 2 decimal places and
				increments/decrements by 0.01
			</div>
			<div class="flex gap-2">
				<Button
					variant="default"
					onclick={() => {
						currencyValue = 1000;
					}}
				>
					1000
				</Button>
				<Button
					variant="destructive"
					onclick={() => {
						currencyValue = 9999.99;
					}}
				>
					9999.99
				</Button>
			</div>
			<div>Current value: {currencyValue}</div>
		</div>
		<div>
			<MySelectMelt
				options={[
					{ value: '1', label: 'Bleach' },
					{ value: '2', label: 'Dan da Dan' },
					{ value: '3', label: 'Re: Zero' },
					{ value: '4', label: 'Jujutsu Kaisen' },
					{ value: '5', label: 'Attack on Titan' },
					{ value: '6', label: 'Death Note' }
				]}
			/>
		</div>
	</div>
</div>
