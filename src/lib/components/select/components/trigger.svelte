<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { ChevronDown } from 'lucide-svelte';

	const {
		elements: { trigger, hiddenInput },
		states: { selectedLabel, selected }
	} = getCtx();
</script>

<input name="test" value={$selected?.value} hidden />
<button
	class="flex h-10 min-w-[220px] items-center justify-between rounded-lg bg-neutral-500 px-3 py-2
text-neutral-700 shadow transition-opacity hover:opacity-90"
	use:melt={$trigger}
	aria-label="Food"
>
	{$selectedLabel || 'Select a flavor'}
	<ChevronDown class="square-5" />
</button>
