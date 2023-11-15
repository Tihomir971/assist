<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getContent } from '../ctx';
	import { cn } from '$lib/scripts/tailwind';
	import { fly } from 'svelte/transition';

	let className: string | undefined = undefined;
	export { className as class };

	const {
		elements: { menu },
		states: { open }
	} = getContent();
	$: builder = $menu;
</script>

{#if $open}
	<div
		use:melt={builder}
		{...$$restProps}
		class={cn(
			'card z-10 flex max-h-[300px] min-w-[220px] flex-col bg-surface-4 p-1 lg:max-h-none ring-0 !important',
			className
		)}
		transition:fly={{ duration: 150, y: -10 }}
	>
		<slot />
	</div>
{/if}

<style lang="postcss">
	/* .menu {
		@apply z-10 flex max-h-[300px] min-w-[220px] flex-col shadow-lg;
		@apply rounded-md bg-surface-900-50-token p-1 shadow-neutral-900/30 lg:max-h-none;
		@apply ring-0 !important;
	} */
</style>
