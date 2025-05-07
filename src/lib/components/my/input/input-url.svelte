<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import PhArrowSquareUpLeft from '~icons/ph/arrow-square-up-left';
	import PhCursorClick from '~icons/ph/cursor-click';
	import BaseInput from './input-base.svelte';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
		label?: string; // New param for label
		inline?: boolean; // New param for positioning
	};

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className = '',
		error,
		label,
		inline,
		...restProps
	}: Props = $props();

	// Generate a unique ID for input-label association if none provided
	const id = $props.id();

	// URL validation function
	function isValidUrl(url: string): boolean {
		if (!url || url.trim() === '') return false;

		try {
			new URL(url);
			return true;
		} catch {
			// Try adding https:// if missing protocol
			if (!/^https?:\/\//i.test(url)) {
				try {
					new URL(`https://${url}`);
					return true;
				} catch {
					return false;
				}
			}
			return false;
		}
	}

	// Get proper URL for href
	function getFormattedUrl(url: string): string {
		if (!url || url.trim() === '') return '';

		// Add https if it doesn't have a protocol
		if (!/^https?:\/\//i.test(url)) {
			return `https://${url}`;
		}

		return url;
	}

	// Track if URL is valid for showing/hiding the visit button
	let isValid = $derived(isValidUrl(value));
	let formattedUrl = $derived(getFormattedUrl(value));
</script>

{#snippet Label()}
	<label for={id} class="input-label">{label}</label>
{/snippet}
{#snippet urlIcon()}
	<PhArrowSquareUpLeft class="text-muted-foreground" />
{/snippet}

{#snippet urlContent()}
	<input
		bind:this={ref}
		bind:value
		type="url"
		{id}
		class="peer w-full border-none bg-transparent outline-none"
		{...restProps}
	/>
{/snippet}

{#snippet urlActions()}
	{#if value && isValid}
		<div
			class="ml-auto flex h-full items-center text-muted-foreground hover:text-primary-foreground"
		>
			<a
				href={formattedUrl}
				target="_blank"
				class="flex aspect-square h-full items-center justify-center rounded-sm"
				aria-label="Visit URL"
			>
				<PhCursorClick />
			</a>
		</div>
	{/if}
{/snippet}

<BaseInput
	bind:ref
	class={className}
	{error}
	{label}
	{inline}
	{Label}
	Icon={urlIcon}
	Content={urlContent}
	Action={urlActions}
/>
