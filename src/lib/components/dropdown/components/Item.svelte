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

<svelte:element this={href ? 'a' : 'div'} {href} use:melt={builder} on:m-click={dispatch}>
	<slot />
</svelte:element>
