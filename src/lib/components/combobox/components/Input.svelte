<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';

	const {
		elements: { input },
		states: { open }
	} = getCtx();
</script>

<div class="relative">
	<input class="input" use:melt={$input} {...$$restProps} placeholder="Best book ever" />
	<div class="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-magnum-900">
		{#if $open}
			<ChevronUp class="square-4" />
		{:else}
			<ChevronDown class="square-4" />
		{/if}
	</div>
</div>
