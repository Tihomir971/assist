<script lang="ts">
	import {
		createCombobox,
		melt,
		type ComboboxOptionProps,
		type ComboboxOption
	} from '@melt-ui/svelte';
	import { Check, ChevronDown, ChevronUp } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { setCtx } from '../ctx';
	import type { ExtendedComboboxOption } from '../types';
	import { Input, Label, Menu, Options } from '..';
	export let options: ExtendedComboboxOption<number>[];
	export let value: number | undefined;
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
		console.log('value', value);
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

<Label>Label</Label>
<!-- <Input /> -->
<!-- <div class="relative">
		<input type="text" use:melt={$input} {...$$restProps} placeholder="Choose..." list="searches" /> -->
<!-- <div class="absolute right-2 top-1/2 z-10 -translate-y-1/2">
			{#if $open}
				<ChevronUp />
			{:else}
				<ChevronDown />
			{/if}
		</div> -->
<!-- 	</div> -->
<input hidden {name} type="text" value={$selected?.value} />

{#if $open}
	<ul
		id="select"
		use:melt={$menu}
		class="z-10 flex max-h-[300px] flex-col overflow-hidden rounded-md"
	>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div class="flex max-h-full flex-col gap-0 overflow-y-auto bg-surface-2 px-2 py-2" tabindex="0">
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
						<span>{singleOption.label}</span>
						{#if singleOption.description}
							<span class="block text-sm text-text-2">{singleOption.description}</span>
						{/if}
					</div>
				</li>
			{:else}
				<li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">No results found</li>
			{/each}
		</div>
	</ul>
{/if}
