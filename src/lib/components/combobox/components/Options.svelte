<script lang="ts">
	import type { ExtendedComboboxOption } from '../types';
	import { melt, type ComboboxOptionProps, type ComboboxOption } from '@melt-ui/svelte';

	import { getContent } from '../ctx';
	import PhCheckBold from '$lib/icons/PhCheckBold.svelte';
	const {
		elements: { option, menu },
		states: { open, touchedInput, inputValue, selected },
		helpers: { isSelected }
	} = getContent();

	export let options: ExtendedComboboxOption[];

	const toOption = (
		option: ExtendedComboboxOption
	): ComboboxOptionProps<ExtendedComboboxOption> => ({
		value: option,
		label: option.label,
		disabled: option.disabled
	});

	$: if (!$open) {
		$inputValue = ($selected?.value as string) ?? '';
	}
	$: filteredOptions = $touchedInput
		? options?.filter(({ label }) => {
				const normalizedInput = $inputValue.toLowerCase();
				return (
					/* id?.toLowerCase().includes(normalizedInput) || */
					label?.toLowerCase().includes(normalizedInput)
				);
			})
		: options;
</script>

{#if $open}
	<ul id="select" use:melt={$menu} class="bg-neutral-200">
		{#each filteredOptions as singleOption, index (index)}
			<!-- use:melt={$option(toOption(singleoption))} -->
			<li
				use:melt={$option(toOption(singleOption))}
				class="flex items-center py-2 pl-4 data-[highlighted]:bg-neutral-500/30 data-[disabled]:opacity-40"
			>
				{#if $isSelected(singleOption)}
					<div class="z-10 -mx-2">
						<PhCheckBold class="w-5" />
						<!-- <iconify-icon icon="ph:check-bold" width="20" height="20"></iconify-icon> -->
					</div>
				{/if}
				<div class="pl-4">
					<span class="font-medium">{singleOption.label}</span>
					{#if singleOption.description}
						<span class="block text-sm">{singleOption.description}</span>
					{/if}
				</div>
			</li>
		{:else}
			<li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">No results found</li>
		{/each}
	</ul>
{/if}
