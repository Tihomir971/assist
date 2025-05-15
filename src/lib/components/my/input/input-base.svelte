<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import type { InputProps } from './types';
	type Props = InputProps & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
		label?: string; // New param for label
		inline?: boolean; // New param for positioning
		Label?: Snippet;
		Icon?: Snippet;
		Content?: Snippet;
		Action?: Snippet;
		rootElement?: HTMLDivElement | null;
	};

	let {
		ref = $bindable(null),
		required,
		class: className = '',
		error,
		label,
		inline = false,
		Label,
		Icon,
		Content,
		Action,
		rootElement = $bindable(null),
		...restProps
	}: Props = $props();
</script>

<div class={cn('w-full', inline ? 'flex items-center gap-3' : 'flex flex-col gap-1', className)}>
	{#if Label}
		<div>
			{@render Label?.()}
			{#if required}
				<span class="text-warning">*</span>
			{/if}
		</div>
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
			class="inline-flex h-10 w-full truncate rounded-sm border border-surface-2 bg-surface-document px-8 text-base ring-primary transition-colors placeholder:text-muted-foreground focus-within:border-primary focus-within:ring hover:border-surface-3 sm:text-sm"
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
			<div class="mt-1 text-sm text-destructive">{error}</div>
		{/if}
	</div>
</div>
