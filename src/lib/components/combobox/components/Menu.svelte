<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { fly } from 'svelte/transition';
	const {
		elements: { menu },
		states: { open }
	} = getCtx();
</script>

{#if $open}
	<ul
		class="z-10 flex max-h-[300px] flex-col overflow-hidden rounded-lg"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -5 }}
	>
		<slot />
	</ul>
{/if}
