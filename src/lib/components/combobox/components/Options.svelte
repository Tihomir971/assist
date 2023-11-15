<script lang="ts">
	import type { ComboboxOptions } from '../types';
	import { Check } from 'lucide-svelte';
	import { melt, type ComboboxOptionProps } from '@melt-ui/svelte';

	import { getContent } from '../ctx';
	const {
		elements: { option },
		states: { open, touchedInput, inputValue, selected },
		helpers: { isSelected }
	} = getContent();

	let options: ComboboxOptions[] = [
		{
			id: 'Kentaro Miura',
			label: 'Berserk'
		},
		{
			id: 'ONE',
			label: 'Mob Psycho 100'
		},
		{
			id: 'Hajime Isayama',
			label: 'Attack on Titan'
		}
	];

	const toOption = (option: ComboboxOptions): ComboboxOptionProps<ComboboxOptions> => ({
		value: option,
		label: option.label,
		disabled: option.disabled
	});

	$: if (!$open) {
		$inputValue = $selected?.label ?? '';
	}
	$: filteredOptions = $touchedInput
		? options.filter(({ id, label }) => {
				const normalizedInput = $inputValue.toLowerCase();
				return (
					id?.toLowerCase().includes(normalizedInput) ||
					label?.toLowerCase().includes(normalizedInput)
				);
		  })
		: options;
</script>

<div class="flex max-h-full flex-col gap-0 overflow-y-auto bg-white px-2 py-2 text-black">
	{#each filteredOptions as singleOption, index (index)}
		<!-- use:melt={$option(toOption(singleoption))} -->
		<li
			use:melt={$option(toOption(singleOption))}
			class="relative cursor-pointer scroll-my-2 rounded-md py-2 pl-4 pr-4 hover:bg-theme-hover
  data-[highlighted]:bg-theme-active data-[highlighted]:text-text-1 data-[disabled]:opacity-50"
		>
			{#if $isSelected(singleOption)}
				<div class="check absolute left-2 top-1/2 z-10 text-text-1">
					<Check class="square-4" />
				</div>
			{/if}
			<div class="pl-4">
				<span class="font-medium">{singleOption.id}</span>
				<span class="block text-sm opacity-75">{singleOption.label}</span>
			</div>
		</li>
	{:else}
		<li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">No results found</li>
	{/each}
</div>
