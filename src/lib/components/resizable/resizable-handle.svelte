<script lang="ts">
	//	import DragHandleDots2 from 'svelte-radix/DragHandleDots2.svelte';
	import * as ResizablePrimitive from 'paneforge';
	import { cn } from '$lib/scripts/tailwind';

	type $$Props = ResizablePrimitive.PaneResizerProps & {
		withHandle?: boolean;
	};

	export let withHandle: $$Props['withHandle'] = false;
	export let el: $$Props['el'] = undefined;
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<ResizablePrimitive.PaneResizer
	bind:el
	class={cn(
		'divider data-[direction=vertical]:divider-vertical data-[direction=horizontal]:*:rotate-45',
		className
	)}
>
	{#if withHandle}
		<div class="z-10 flex h-6 w-6 items-center justify-center">
			<iconify-icon icon="ph:dots-six-bold" width="24" height="24"></iconify-icon>
			<!-- <iconify-icon inline icon="ph:dots-six" width="16" height="16" rotate="90deg"></iconify-icon> -->
			<!-- <DragHandleDots2 class="h-2.5 w-2.5" /> -->
		</div>
	{/if}
</ResizablePrimitive.PaneResizer>
