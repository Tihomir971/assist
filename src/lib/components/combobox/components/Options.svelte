<script lang="ts">
	import type { ExtendedComboboxOption } from '../types';
	import { Check } from 'lucide-svelte';
	import { melt, type ComboboxOptionProps, type ComboboxOption } from '@melt-ui/svelte';

	import { getContent } from '../ctx';
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
	<!-- <div class="flex max-h-full flex-col gap-0 overflow-y-auto bg-white px-2 py-2 text-black"> -->
	<ul id="select" use:melt={$menu} class="bg-surface-2">
		{#each filteredOptions as singleOption, index (index)}
			<!-- use:melt={$option(toOption(singleoption))} -->
			<li
				use:melt={$option(toOption(singleOption))}
				class="flex py-2 pl-4 items-center data-[highlighted]:bg-accent/30 data-[disabled]:opacity-40"
			>
				<!-- class="relative cursor-pointer scroll-my-2 rounded-md py-2 pl-4 pr-4
 data-[highlighted]:text-text-1 data-[disabled]:opacity-50 data-[highlighted]:bg-accent" -->
				{#if $isSelected(singleOption)}
					<div class="-mx-2 z-10 text-accent">
						<Check size="20" />
					</div>
				{/if}
				<div class="pl-4">
					<span class="font-medium">{singleOption.label}</span>
					{#if singleOption.description}
						<span class="block text-sm text-text-2">{singleOption.description}</span>
					{/if}
				</div>
			</li>
		{:else}
			<li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">No results found</li>
		{/each}
	</ul>
{/if}

<style lang="postcss">
	ul {
		border-radius: var(--radius-2);
	}
</style>
