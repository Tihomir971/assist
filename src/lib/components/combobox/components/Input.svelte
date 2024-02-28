<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	const {
		elements: { input },
		states: { open, inputValue, selected }
	} = getCtx();
</script>

<!-- <div class="relative"> -->
<input type="text" use:melt={$input} {...$$restProps} placeholder="Choose..." list="searches" />
<!-- <div class="absolute right-2 top-1/2 z-10 -translate-y-1/2">
		{#if $open}
			<ChevronUp />
		{:else}
			<ChevronDown />
		{/if}
	</div> -->
<!-- </div> -->
