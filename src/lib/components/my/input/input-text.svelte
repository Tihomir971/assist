<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import PhTextAa from '~icons/ph/text-aa';
	import BaseInput from './input-base.svelte';
	import type { InputProps } from './types';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
		label?: string; // New param for label
		inline?: boolean; // New param for positioning
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className = '',
		error,
		label, // New param
		inline, // New param
		...restProps
	}: Props = $props();
	const id = $props.id(); // Generate a unique ID for input-label association if none provided
</script>

{#snippet Label()}
	<label for={id} class="input-label">
		{label}
	</label>
{/snippet}

{#snippet Icon()}
	<PhTextAa />
{/snippet}

{#snippet Content()}
	<input
		{id}
		bind:value
		type="text"
		class="peer w-full border-none bg-transparent outline-none"
		{...restProps}
	/>
{/snippet}

{#snippet Action()}
	<!-- No actions for text input -->
{/snippet}

<BaseInput
	bind:ref
	class={className}
	{error}
	{label}
	{inline}
	{Label}
	{Icon}
	{Content}
	{Action}
	id={restProps.id}
/>
