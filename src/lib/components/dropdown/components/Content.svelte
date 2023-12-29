<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getContent } from '../ctx';
	import { cn } from '$lib/scripts/tailwind';
	import { fly } from 'svelte/transition';

	let className: string | undefined = undefined;
	export { className as class };

	const {
		elements: { menu },
		states: { open }
	} = getContent();
	$: builder = $menu;
</script>

{#if $open}
	<div
		use:melt={builder}
		{...$$restProps}
		transition:fly={{ duration: 150, y: -10 }}
		class="z-50 rounded-box"
	>
		<ul class={cn('menu dropdown-content w-52 rounded-btn bg-base-300 p-2 shadow', className)}>
			<slot />
		</ul>
	</div>
{/if}
