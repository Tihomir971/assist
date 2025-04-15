<script lang="ts">
	import { cn } from '$lib/utils';
	import { Select } from 'melt/builders';
	import PhCheck from '~icons/ph/check';
	import type { SvelteHTMLElements } from 'svelte/elements';

	/* 	const options = [
		{ value: '1', name: 'Bleach' },
		{ value: '2', name: 'Dan da Dan' },
		{ value: '3', name: 'Re: Zero' },
		{ value: '4', name: 'Jujutsu Kaisen' },
		{ value: '5', name: 'Attack on Titan' },
		{ value: '6', name: 'Death Note' }
	] as const; */

	type Props = SvelteHTMLElements['HTMLSelectElement'] & {
		options: { value: string; label: string }[];
	};
	let { value = $bindable(), options = [], ...restProps }: Props = $props();

	const select = new Select({
		onValueChange: (newValue) => (value = newValue ? parseInt(newValue) : undefined)
	});

	const selectedName = $derived(
		select.value
			? options.find((option) => option.value === select.value)?.label
			: 'Select an anime'
	);
</script>

<div class="mx-auto flex w-[300px] flex-col gap-1">
	<label for={select.ids.trigger}>Anime</label>
	<button
		{...select.trigger}
		class="flex items-center justify-between overflow-hidden rounded-xl border border-gray-500 bg-surface-document py-2 pr-4 pl-3 text-left text-ink
    transition hover:cursor-pointer hover:bg-surface-1
    active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
       dark:active:bg-gray-600/50"
	>
		{selectedName ?? 'Select an anime'}
	</button>

	<div {...select.content} class="rounded-xl border border-gray-500 bg-surface-1 p-2 shadow">
		{#each options as option}
			<div
				{...select.getOption(option.value)}
				class={cn(
					'relative flex items-center justify-between rounded-xl py-2 pr-2 pl-8',
					select.highlighted === option.value && 'bg-surface-2',
					select.value === option.value && 'font-semibold'
				)}
			>
				<span>{option.label}</span>
				{#if select.isSelected(option.value)}
					<PhCheck class="text-accent-300 font-bold" />
				{/if}
			</div>
		{/each}
	</div>
</div>
