<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhTextAa from '~icons/ph/text-aa';
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
</script>

{#snippet textIcon()}
	<PhTextAa class="text-base text-muted-foreground" />
{/snippet}

{#snippet textContent()}
	<input
		bind:value
		type="text"
		class={cn(
			'peer flex h-full w-full items-center border-none pl-2',
			'text-primary-foreground outline-none'
		)}
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
	Icon={textIcon}
	Content={textContent}
	Action={emptyActions}
/>
