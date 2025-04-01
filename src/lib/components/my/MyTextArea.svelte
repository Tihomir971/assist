<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhTextAa from '~icons/ph/text-aa';
	import PhNumpad from '~icons/ph/numpad';
	import PhPlusCircle from '~icons/ph/plus-circle';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';
	import PhMagnifyingGlass from '~icons/ph/magnifying-glass';
	import PhArrowSquareUpLeft from '~icons/ph/arrow-square-up-left';
	import PhCursorClick from '~icons/ph/cursor-click';
	import PhFile from '~icons/ph/file';

	type Props = SvelteHTMLElements['textarea'] & {
		ref?: HTMLTextAreaElement | null;
	};

	let {
		ref = $bindable(null),
		value = $bindable(''), // Initialize to empty string or handle potential undefined
		class: className,
		...restProps
	}: Props = $props();
</script>

<div
	class={cn(
		'flex rounded-sm border border-solid border-[rgb(63,63,63)] bg-transparent focus-within:border-[rgb(110,110,110)]',

		className
	)}
>
	<textarea
		bind:value
		bind:this={ref}
		class={cn('flex h-full w-full  border-none pl-2 text-primary-foreground outline-none')}
		{...restProps}
	></textarea>
</div>
