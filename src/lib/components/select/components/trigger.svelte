<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	const {
		elements: { trigger, hiddenInput },
		states: { selectedLabel, selected }
	} = getCtx();
</script>

<div>
	<input name="test" value={$selected?.value} hidden />
	<button use:melt={$trigger} aria-label="Food" class="select select-bordered items-center">
		{$selectedLabel || 'Select'}
		<!-- <ChevronDown class="square-5" /> -->
	</button>
</div>
<!-- class="flex h-10 min-w-[220px] items-center justify-between rounded-lg bg-neutral-500 px-3 py-2
text-neutral-700 shadow transition-opacity hover:opacity-90" -->
