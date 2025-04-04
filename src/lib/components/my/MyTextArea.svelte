<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

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
