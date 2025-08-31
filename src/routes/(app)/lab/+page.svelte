<script lang="ts">
	import { CheckboxArk } from '$lib/components/ark/checkbox';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// import { CheckboxArk } from '$lib/components/ark';

	// now with tree-shaking

	let checked: 'indeterminate' | boolean = $state('indeterminate');
	$inspect('checked', checked);
</script>

<div class="app">
	<!-- 	<div class="flex h-full content-center gap-4 p-8 *:size-28 *:place-content-center *:text-center">
		<div class="bg-primary">Primary</div>
		<div class="bg-secondary">Secondary</div>
		<div class="bg-error">Error</div>
		<div class="bg-warning">Warning</div>
		<div class="bg-info">Info</div>
		<div class="bg-success">Success</div>
	</div> -->
	<!-- <Chart {init} {options} /> -->
	<div class="m-8 bg-[#191918] p-8">
		<CheckboxArk bind:checked label="Label" invalid />
	</div>
</div>

<style>
	.app {
		width: 100vw;
		height: 100vh;
	}
</style>
