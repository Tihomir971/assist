<script lang="ts">
	import PhCheck from '$lib/icons/PhCheck.svelte';
	import PhCaretDown from '$lib/icons/PhCaretDown.svelte';
	import PhCaretUp from '$lib/icons/PhCaretUp.svelte';
	import {
		createCombobox,
		melt,
		type ComboboxOption,
		type ComboboxOptionProps
	} from '@melt-ui/svelte';

	import { fly } from 'svelte/transition';

	export let options: ComboboxOption<number>[] = [];
	export let name = '';
	export let id: string = '';
	export let placeholder = '';
	export let value: number | null = null;

	const toOption = (option: ComboboxOption<number>): ComboboxOptionProps<number> => ({
		value: option.value,
		label: option.label
	});

	const {
		elements: { menu, input, option, label: labelEl, hiddenInput },
		states: { open, inputValue, touchedInput, selected },
		helpers: { isSelected }
	} = createCombobox({
		name: name,
		ids: { menu: id },
		forceVisible: true,
		defaultSelected: value !== null ? options.find((o) => o.value === value) : undefined
	});

	$: if (!$open) {
		$inputValue = $selected?.label ?? '';
	}
	$: if (!$open) {
		value = $selected?.value ?? null;
	}

	$: filteredOptions = $touchedInput
		? options.filter(({ label }) => {
				const normalizedInput = $inputValue.toLowerCase();
				return label?.toLowerCase().includes(normalizedInput);
			})
		: options;
</script>

<div class="relative">
	<input
		use:melt={$input}
		class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid]:border-destructive [&>span]:line-clamp-1 data-[placeholder]:[&>span]:text-muted-foreground"
		{placeholder}
		{...$$restProps}
	/>
	<div class="absolute right-2 top-1/2 z-10 -translate-y-1/2">
		{#if $open}
			<PhCaretUp class="size-4" />
		{:else}
			<PhCaretDown class="size-4" />
		{/if}
	</div>
</div>
<input use:melt={$hiddenInput} value={value === null ? '' : value} />
{#if $open}
	<ul
		class="z-10 flex max-h-[300px] list-none flex-col overflow-hidden rounded-lg border bg-popover p-1"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -5 }}
	>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div class="flex max-h-full flex-col gap-0 overflow-y-auto p-0" tabindex="0">
			{#each filteredOptions as opt, index (index)}
				<li
					use:melt={$option(toOption(opt))}
					class="relative cursor-pointer scroll-my-2 rounded-md py-2 text-sm
		  hover:bg-violet-100
		  data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground
			data-[disabled]:opacity-50"
				>
					{#if $isSelected(opt)}
						<div class="check absolute left-2 top-1/2 z-10 text-white">
							<PhCheck class="size-4" />
						</div>
					{/if}
					<div class="pl-4">
						<span>{opt.label}</span>
					</div>
				</li>
			{:else}
				<li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">No results found</li>
			{/each}
		</div>
	</ul>
{/if}

<style lang="postcss">
	.check {
		@apply absolute left-2 top-1/2 text-violet-500;
		translate: 0 calc(-50% + 1px);
	}
</style>
