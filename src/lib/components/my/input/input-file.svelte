<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhFile from '~icons/ph/file';
	import BaseInput from './input-base.svelte';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
		labelText?: string; // New param for label
		inline?: boolean; // New param for positioning
	};

	let {
		ref = $bindable(null),
		class: className = '',
		error,
		labelText,
		inline,
		...restProps
	}: Props = $props();

	// Generate a unique ID for input-label association if none provided
	const inputId = restProps.id || `input-${Math.random().toString(36).slice(2, 11)}`;

	let fileName = $state('');

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			fileName = target.files[0].name;
		} else {
			fileName = '';
		}
	}
</script>

{#snippet fileIcon()}
	<PhFile class="text-muted-foreground" />
{/snippet}

{#snippet fileContent()}
	<div class="relative h-full w-full">
		<input
			bind:this={ref}
			type="file"
			id={inputId}
			class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
			onchange={handleFileChange}
			{...restProps}
		/>
		<div class="peer w-full overflow-hidden text-ellipsis whitespace-nowrap">
			{fileName || 'Select file...'}
		</div>
	</div>
{/snippet}

{#snippet emptyActions()}
	<!-- No actions for file input -->
{/snippet}

<BaseInput
	bind:ref
	class={className}
	{error}
	{labelText}
	{inline}
	Icon={fileIcon}
	Content={fileContent}
	Action={emptyActions}
/>
