<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import { melt } from '@melt-ui/svelte';
	import Tab from './tab.svelte';
	import { getCtx } from './ctx';

	const { list, tabs } = getCtx();

	let className = '';
	export { className as class };
</script>

<div class={cn('tabs tabs-bordered', className)} use:melt={$list}>
	{#each $tabs as tab}
		<Tab {tab} />
	{/each}
</div>
