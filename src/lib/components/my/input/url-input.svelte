<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhArrowSquareUpLeft from '~icons/ph/arrow-square-up-left';
	import PhCursorClick from '~icons/ph/cursor-click';
	import BaseInput from './base-input.svelte';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
	};

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className = '',
		error,
		...restProps
	}: Props = $props();

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

{#snippet urlIcon()}
	<PhArrowSquareUpLeft class="text-muted-foreground" />
{/snippet}

{#snippet urlContent()}
	<input
		bind:this={ref}
		bind:value
		type="url"
		class={cn(
			'peer flex h-full w-full items-center border-none pl-2',
			'text-primary-foreground outline-none'
		)}
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
	Icon={urlIcon}
	Content={urlContent}
	Action={urlActions}
/>
