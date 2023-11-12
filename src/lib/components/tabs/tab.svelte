<script lang="ts">
	import { Npm, Yarn, Pnpm } from '../icons/index.js';
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from './ctx.js';

	export let tab: string;

	const { trigger } = getCtx();
</script>

<button
	use:melt={$trigger(tab)}
	class="text-center cursor-pointer transition-colors duration-100 flex-none px-4 py-2 rounded-tl-container-token rounded-tr-container-token
        hover:variant-soft focus-visible:!border-primary-400 focus-visible:!ring-0
        data-[state=active]:!border-primary-900-50-token data-[state=active]:py-2 data-[state=active]:border-b-2 data-[state=active]:opacity-100"
>
	<div class="flex items-center gap-2 px-1">
		<span>{tab}</span>
	</div>
</button>
