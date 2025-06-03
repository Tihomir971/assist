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
			class="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
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
