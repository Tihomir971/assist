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
	<div
		class="grid h-full grid-cols-8 content-center gap-4 p-8 *:size-28 *:place-content-center *:text-center"
	>
		<div class="bg-error">Error</div>
		<div class="bg-warning">Warning</div>
		<div class="bg-info">Info</div>
		<div class="bg-background text-foreground">Background</div>
		<div class="bg-card text-card-foreground">Card</div>
		<div class="bg-popover text-popover-foreground">Popover</div>
		<div class="bg-primary text-primary-foreground">Primary</div>
		<div class="bg-secondary text-secondary-foreground">Secondary</div>
		<div class="bg-muted text-muted-foreground">Muted</div>
		<div class="bg-accent text-accent-foreground">Accent</div>
		<div class="bg-destructive text-destructive-foreground">Destructive</div>
		<div class="bg-border">Border</div>
		<div class="bg-input">Input</div>
		<div class="bg-ring">Ring</div>
	</div>
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
