<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
		Icon?: Snippet;
		Content?: Snippet;
		Action?: Snippet;
	};

	let {
		ref = $bindable(null),
		class: className = '',
		error,
		Icon,
		Content,
		Action,
		...restProps
	}: Props = $props();
</script>

<div
	class={cn(
		'flex h-10 w-full items-center rounded-sm border border-solid border-input bg-background px-2 focus-within:border-primary',
		className
	)}
>
	<div class="leading-icon">
		{@render Icon?.()}
	</div>

	<div class="input-container flex-grow">
		{@render Content?.()}
	</div>

	<div class="action-buttons">
		{@render Action?.()}
	</div>
</div>

{#if error}
	<div class="mt-1 text-sm text-destructive">{error}</div>
{/if}
