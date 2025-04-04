<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhFile from '~icons/ph/file';
	import BaseInput from './base-input.svelte';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
		error?: string;
	};

	let { ref = $bindable(null), class: className = '', error, ...restProps }: Props = $props();

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
			class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
			onchange={handleFileChange}
			{...restProps}
		/>
		<div
			class="peer flex h-full w-full items-center overflow-hidden border-none pl-2 text-ellipsis whitespace-nowrap text-primary-foreground"
		>
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
	Icon={fileIcon}
	Content={fileContent}
	Action={emptyActions}
/>
