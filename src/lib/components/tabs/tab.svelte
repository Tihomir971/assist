<script lang="ts">
	import { Npm, Yarn, Pnpm } from '../icons/index.js';
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from './ctx.js';

	export let tab: string;

	const { trigger } = getCtx();
</script>

<button
	use:melt={$trigger(tab)}
	class="rounded-lg border border-transparent bg-neutral-800 px-3 py-2 text-neutral-400 transition
        hover:opacity-100 focus-visible:!border-primary-400 focus-visible:!text-primary-400 focus-visible:!ring-0
        data-[state=active]:border-primary-700 data-[state=active]:py-2 data-[state=active]:text-primary-600 data-[state=active]:opacity-100"
>
	<div class="flex items-center gap-2 px-1">
		<span class="font-mono text-sm font-semibold">{tab}</span>
	</div>
</button>
