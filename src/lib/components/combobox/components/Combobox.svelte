<script lang="ts">
	import {
		createCombobox,
		melt,
		type ComboboxOptionProps,
		type ComboboxOption
	} from '@melt-ui/svelte';
	//import { Check, ChevronDown, ChevronUp } from 'lucide-svelte';
	//import { fly } from 'svelte/transition';
	import { setCtx } from '../ctx';
	import type { ExtendedComboboxOption } from '../types';
	import { Input, Label, Menu, Options } from '..';
	export let options: ExtendedComboboxOption<number>[];
	export let value: number | null | undefined;
	export let labela: string;
	//	const def = options.find((obj) => obj.value === value);
	//let defaultSelected:ComboboxOption<number>;
	//defaultSelected={value:def.id}
	export let name: string;
	//	export let label:string
	//	const {} = setCtx({});

	const toOption = (option: ExtendedComboboxOption<number>): ComboboxOptionProps<number> => ({
		value: option.value,
		label: option.label,
		disabled: option.disabled
	});

	const {
		elements: { menu, input, option, label },
		states: { open, inputValue, touchedInput, selected },
		helpers: { isSelected }
	} = setCtx({ defaultSelected: options.find((obj) => obj.value === value) });

	$: if (!$open) {
		$inputValue = $selected?.label ?? '';
		value = $selected?.value;
	}

	$: filteredOptions = $touchedInput
		? options.filter(({ label, description }) => {
				const normalizedInput = $inputValue.toLowerCase();
				return (
					label?.toLowerCase().includes(normalizedInput) ||
					description?.toLowerCase().includes(normalizedInput)
				);
			})
		: options;
</script>

<Label>{labela}</Label>

<input hidden {name} type="text" value={$selected?.value} />

{#if $open}
	<ul
		id="select"
		use:melt={$menu}
		class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
	>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<!-- 		<div
			class="flex max-h-full flex-col gap-0 overflow-y-auto bg-neutral-200 px-2 py-2"
			tabindex="0"
		> -->
		{#each filteredOptions as singleOption, index (index)}
			<li
				use:melt={$option(toOption(singleOption))}
				class="data-[disabled]:select-disabled data-[highlighted]:bg-neutral-500/30"
			>
				{#if $isSelected(singleOption)}
					<!-- <div class="z-10 -mx-2"> -->
					<!-- <Check /> -->
					<!-- </div> -->
				{/if}
				<!-- <div class="pl-4"> -->
				<span>{singleOption.label}</span>
				{#if singleOption.description}
					<span class="block text-sm">{singleOption.description}</span>
				{/if}
				<!-- </div> -->
			</li>
		{:else}
			<li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">No results found</li>
		{/each}
		<!-- </div> -->
	</ul>
{/if}

<style lang="postcss">
	.select-disabled {
		cursor: not-allowed;
		--tw-border-opacity: 1;
		border-color: var(--fallback-b2, oklch(var(--b2) / var(--tw-border-opacity)));
		--tw-bg-opacity: 1;
		background-color: var(--fallback-b2, oklch(var(--b2) / var(--tw-bg-opacity)));
		--tw-text-opacity: 0.2;
	}
</style>
