<script lang="ts">
	import TextInput from './input-text.svelte';
	import NumberInput from './input-number.svelte';
	import DateInput from './input-date.svelte';
	import UrlInput from './input-url.svelte';
	import FileInput from './input-file.svelte';
	import CurrencyInput from './input-currency.svelte';

	// Sample values for demonstration
	let textValue = 'Sample text';
	let numberValue = 42;
	let dateValue = new Date();
	let urlValue = 'https://example.com';
	let currencyValue = 1250.75;
</script>

<div class="space-y-8 p-4">
	<h1 class="mb-6 text-2xl font-bold">Input Components with Labels</h1>

	<!-- Standard Labels (above inputs) -->
	<div class="space-y-4 rounded-md border p-4">
		<h2 class="mb-2 text-xl font-semibold">Standard Labels (above inputs)</h2>

		<TextInput labelText="Username" bind:value={textValue} placeholder="Enter username" />

		<NumberInput labelText="Quantity" bind:value={numberValue} min={0} max={100} />

		<DateInput labelText="Birth Date" bind:value={dateValue} />

		<UrlInput labelText="Website URL" bind:value={urlValue} placeholder="Enter website URL" />

		<FileInput labelText="Profile Picture" accept="image/*" />

		<CurrencyInput labelText="Price" bind:value={currencyValue} currency="EUR" />
	</div>

	<!-- Inline Labels (beside inputs) -->
	<div class="space-y-4 rounded-md border p-4">
		<h2 class="mb-2 text-xl font-semibold">Inline Labels (beside inputs)</h2>

		<TextInput labelText="Username" inline bind:value={textValue} placeholder="Enter username" />

		<NumberInput labelText="Quantity" inline bind:value={numberValue} min={0} max={100} />

		<DateInput labelText="Birth Date" inline bind:value={dateValue} />

		<UrlInput
			labelText="Website URL"
			inline
			bind:value={urlValue}
			placeholder="Enter website URL"
		/>

		<FileInput labelText="Profile Picture" inline accept="image/*" />

		<CurrencyInput labelText="Price" inline bind:value={currencyValue} currency="EUR" />
	</div>

	<!-- With Error Messages -->
	<div class="space-y-4 rounded-md border p-4">
		<h2 class="mb-2 text-xl font-semibold">With Error Messages</h2>

		<TextInput labelText="Username" bind:value={textValue} error="Username is required" />

		<NumberInput
			labelText="Quantity"
			inline
			bind:value={numberValue}
			error="Quantity must be between 1 and 100"
		/>
	</div>
</div>
