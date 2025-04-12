<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhTextAa from '~icons/ph/text-aa';
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
		value = $bindable(''),
		class: className = '',
		error,
		labelText, // New param
		inline, // New param
		...restProps
	}: Props = $props();
</script>

{#snippet textIcon()}
	<PhTextAa />
{/snippet}

{#snippet textContent()}
	<input
		bind:value
		type="text"
		class="peer w-full border-none bg-transparent outline-none"
		{...restProps}
	/>
{/snippet}

{#snippet emptyActions()}
	<!-- No actions for text input -->
{/snippet}

<BaseInput
	bind:ref
	class={className}
	{error}
	{labelText}
	{inline}
	Icon={textIcon}
	Content={textContent}
	Action={emptyActions}
	id={restProps.id}
	{...restProps}
/>
