<script lang="ts">
	import { Npm, Yarn, Pnpm } from '../icons/index.js';
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from './ctx.js';

	export let tab: string;

	const { trigger } = getCtx();
</script>

<button
	use:melt={$trigger(tab)}
	class="rounded-tl-container-token rounded-tr-container-token hover:variant-soft flex-none cursor-pointer border-none bg-inherit px-4 py-2 text-center text-neutral-100
        transition-colors duration-100 focus-visible:!border-neutral-400 focus-visible:!ring-0
        data-[state=active]:border-b-2 data-[state=active]:!border-neutral-100 data-[state=active]:py-2 data-[state=active]:opacity-100"
>
	<div class="flex items-center gap-2 px-1">
		<span>{tab}</span>
	</div>
</button>
