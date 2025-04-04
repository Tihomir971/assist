<script lang="ts">
	import { onMount } from 'svelte';

	import {
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
			currencyValue
		});
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
		<!-- Text Input -->
		<div class="card rounded-md border p-4">
			<h2 class="mb-2 text-lg font-semibold">Text Input</h2>
			<div class="mb-2">
				<MyTextInput bind:value={textValue} placeholder="Enter text..." error={textError} />
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-primary px-3 py-1 text-primary-foreground"
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
					class="rounded-md bg-primary px-3 py-1 text-primary-foreground"
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
					class="rounded-md bg-primary px-3 py-1 text-primary-foreground"
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
					class="rounded-md bg-primary px-3 py-1 text-primary-foreground"
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
					class="rounded-md bg-primary px-3 py-1 text-primary-foreground"
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
