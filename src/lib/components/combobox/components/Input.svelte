<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';

	const {
		elements: { input },
		states: { open, inputValue, selected }
	} = getCtx();
</script>

<div class="relative">
	<input class="input" use:melt={$input} {...$$restProps} placeholder="Choose..." />
	<div class="absolute right-2 top-1/2 z-10 -translate-y-1/2">
		{#if $open}
			<ChevronUp />
		{:else}
			<ChevronDown />
		{/if}
	</div>
</div>
<p>InputValue: {$inputValue}</p>
<p>Selected: {JSON.stringify($selected, null, 2)}</p>
