<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
		labelText?: string; // New param for label
		inline?: boolean; // New param for positioning
		Icon?: Snippet;
		Content?: Snippet;
		Action?: Snippet;
		rootElement?: HTMLDivElement | null; // Add prop to bind the root element
	};

	let {
		ref = $bindable(null),
		class: className = '',
		error,
		labelText, // New parameter
		inline = false, // New parameter with default value
		Icon,
		Content,
		Action,
		rootElement = $bindable(null), // Bind the root element
		...restProps
	}: Props = $props();

	// Generate a unique ID for input-label association if none provided
	const inputId = restProps.id || `input-${Math.random().toString(36).slice(2, 11)}`;
</script>

<!-- Container div that handles the inline layout -->
<div class={cn('w-full', inline ? 'flex items-center gap-3' : '')}>
	{#if labelText}
		<label
			for={inputId}
			class={cn(' text-sm text-muted-foreground ', inline ? 'min-w-[120px] shrink-0' : 'mb-2')}
		>
			{labelText}
		</label>
	{/if}

	<!-- Input container -->
	<div bind:this={rootElement} class={cn('relative w-full')}>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground"
		>
			{@render Icon?.()}
		</div>

		<div
			class="inline-flex h-10 w-full truncate rounded-sm border bg-surface-document px-8 text-base ring-primary transition-colors placeholder:text-muted-foreground focus-within:border-primary focus-within:ring hover:border-surface-3 sm:text-sm"
		>
			{@render Content?.()}
		</div>
		{#if Action}
			<div class="absolute end-2 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
				{@render Action()}
			</div>
		{/if}

		{#if error}
			<div class="mt-1 text-sm text-destructive">{error}</div>
		{/if}
	</div>
</div>
