<script lang="ts">
	import { Combobox } from '$lib/components/ui-custom';
	import type { PageProps } from './$types';
	import { forma } from './data.remote';

	let { data }: PageProps = $props();

	const frameworks = [
		{
			value: 'sveltekit',
			label: 'SvelteKit'
		},
		{
			value: 'next.js',
			label: 'Next.js'
		},
		{
			value: 'nuxt.js',
			label: 'Nuxt.js'
		},
		{
			value: 'remix',
			label: 'Remix'
		},
		{
			value: 'astro',
			label: 'Astro'
		}
	];

	let selectedFramework = $state('');

	// Example of handling selection
	function handleFrameworkSelect(value: string) {
		console.log('Selected framework:', value);
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<h1 class="text-2xl font-bold">Combobox Component Examples</h1>

	<div class="space-y-4">
		<h2 class="text-lg font-semibold">Basic Usage</h2>
		<Combobox
			bind:value={selectedFramework}
			items={frameworks}
			placeholder="Select a framework..."
			searchPlaceholder="Search frameworks..."
		/>
		<p class="text-sm text-muted-foreground">Selected value: {selectedFramework || 'None'}</p>
	</div>

	<div class="space-y-4">
		<h2 class="text-lg font-semibold">With Label and Form Integration</h2>
		<form {...forma}>
			<Combobox
				name={forma.fields.framework.as('text').name}
				aria-invalid={forma.fields.framework.as('text')['aria-invalid']}
				items={frameworks}
				label="Select Framework"
				id="framework-select"
				placeholder="Choose a framework"
				searchPlaceholder="Type to filter..."
				required={true}
			/>
			<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
				Submit Form
			</button>
		</form>
		<p class="text-sm text-muted-foreground">
			The combobox includes a hidden input for form submission
		</p>
	</div>

	<div class="space-y-4">
		<h2 class="text-lg font-semibold">With Custom Width and Callback</h2>
		<Combobox
			bind:value={selectedFramework}
			items={frameworks}
			placeholder="Choose your favorite framework"
			searchPlaceholder="Type to filter..."
			width="300px"
			onSelect={handleFrameworkSelect}
		/>
		<p class="text-sm text-muted-foreground">Check console for selection events</p>
	</div>

	<div class="space-y-4">
		<h2 class="text-lg font-semibold">Disabled State</h2>
		<Combobox
			bind:value={selectedFramework}
			items={frameworks}
			placeholder="This combobox is disabled"
			disabled={true}
		/>
	</div>
</div>
