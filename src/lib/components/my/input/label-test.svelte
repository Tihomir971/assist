<script lang="ts">
	import TextInput from './input-text.svelte';
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

		<TextInput label="Username" bind:value={textValue} placeholder="Enter username" />

		<DateInput label="Birth Date" bind:value={dateValue} />

		<UrlInput label="Website URL" bind:value={urlValue} placeholder="Enter website URL" />

		<FileInput label="Profile Picture" accept="image/*" />

		<CurrencyInput label="Price" bind:value={currencyValue} currency="EUR" />
	</div>

	<!-- Inline Labels (beside inputs) -->
	<div class="space-y-4 rounded-md border p-4">
		<h2 class="mb-2 text-xl font-semibold">Inline Labels (beside inputs)</h2>

		<TextInput label="Username" inline bind:value={textValue} placeholder="Enter username" />

		<DateInput label="Birth Date" inline bind:value={dateValue} />

		<UrlInput label="Website URL" inline bind:value={urlValue} placeholder="Enter website URL" />

		<FileInput label="Profile Picture" inline accept="image/*" />

		<CurrencyInput label="Price" inline bind:value={currencyValue} currency="EUR" />
	</div>

	<!-- With Error Messages -->
	<div class="space-y-4 rounded-md border p-4">
		<h2 class="mb-2 text-xl font-semibold">With Error Messages</h2>

		<TextInput label="Username" bind:value={textValue} error="Username is required" />
	</div>
</div>
