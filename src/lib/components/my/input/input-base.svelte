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
		Label?: Snippet;
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
			class={cn('text-sm font-medium text-foreground', inline ? 'min-w-[120px] shrink-0' : 'mb-2')}
		>
			{labelText}
		</label>
	{/if}

	<!-- Input container -->
	<div bind:this={rootElement} class={cn('relative w-full')}>
		<!-- 	<div
			class={cn(
				'flex h-10 w-full items-center rounded-sm border border-solid border-input bg-background px-2 focus-within:border-primary',
				className
			)}
		> -->
		<div class="absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground">
			{@render Icon?.()}
		</div>

		<div
			class="inline-flex h-10 w-full truncate border bg-background px-8 text-base transition-colors placeholder:text-muted-foreground focus-within:border-primary focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background focus:outline-hidden sm:text-sm"
		>
			{@render Content?.()}
		</div>

		<div
			class="absolute end-2 top-1/2 flex h-full -translate-y-1/2 items-center text-muted-foreground"
		>
			{@render Action?.()}
		</div>
		<!-- </div> -->

		{#if error}
			<div class="mt-1 text-sm text-destructive">{error}</div>
		{/if}
	</div>
</div>
