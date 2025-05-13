<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
		label?: string; // New param for label
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
		label, // New parameter
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
<div
	class={cn('mb-2 w-full', inline ? 'flex items-center gap-3' : 'flex flex-col gap-0.5', className)}
>
	{#if label}
		<label for={inputId} class={cn('', inline ? 'min-w-[120px] shrink-0' : 'mb-1')}>
			{label}{#if restProps.required}<span class="ml-1 text-warning">*</span>{/if}
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
			class="inline-flex h-10 w-full truncate rounded-sm border border-surface-2 bg-surface-document px-8 text-base ring-primary transition-colors placeholder:text-muted-foreground focus-within:border-primary focus-within:ring hover:border-surface-3"
		>
			{@render Content?.()}
		</div>
		{#if Action || restProps.readonly}
			<div class="absolute end-2 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
				{#if restProps.readonly}
					<PhPencilSimpleSlash />
				{:else if Action}
					{@render Action()}
				{/if}
			</div>
		{/if}

		{#if error}
			<div class="mt-1 text-destructive">{error}</div>
		{/if}
	</div>
</div>
