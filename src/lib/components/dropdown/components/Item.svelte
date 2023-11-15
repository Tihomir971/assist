<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { createDispatcher } from '$lib/components/internal';
	export let href: string | undefined = undefined;
	const {
		elements: { item }
	} = getCtx();

	$: builder = $item;

	const dispatch = createDispatcher();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	use:melt={builder}
	on:m-click={dispatch}
	class="item"
>
	<slot />
</svelte:element>

<style lang="postcss">
	.item {
		@apply relative h-6 min-h-[24px] select-none rounded-sm pl-6 pr-1;
		@apply z-20 outline-none;
		@apply data-[highlighted]:bg-theme-active data-[highlighted]:text-text-1;
		@apply data-[disabled]:text-neutral-300;
		@apply flex items-center text-sm leading-none;
		@apply ring-0 !important;
	}
</style>
