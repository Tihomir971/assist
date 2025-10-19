<script lang="ts">
	import type { PageProps } from './$types';
	import { forma } from './data.remote';

	let { data }: PageProps = $props();



	let selectedFramework = $state('');

	// Example of handling selection
	function handleFrameworkSelect(value: string) {
		console.log('Selected framework:', value);
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<h1 class="text-2xl font-bold">Combobox Component Examples</h1>
</div>
