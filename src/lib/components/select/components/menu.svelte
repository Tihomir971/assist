<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { fade } from 'svelte/transition';

	//	export let title: string | undefined = 'Labela';
	const {
		elements: { menu },
		states: { open }
	} = getCtx();
</script>

{#if $open}
	<div
		class="z-10 flex max-h-[300px] flex-col
    overflow-y-auto rounded-lg bg-surface-2 p-1
    shadow focus:!ring-0 h-52"
		use:melt={$menu}
		transition:fade={{ duration: 150 }}
	>
		<slot />
	</div>
{/if}
