<script lang="ts">
	import { Combobox } from 'melt/builders';
	import Check from '~icons/ph/check';
	import PhCaretDown from '~icons/ph/caret-down';
	import { cn } from '$lib/utils';

	type OptionType = {
		value: number;
		label: string;
	};

	interface ComboboxProps {
		options: OptionType[];
		value?: string;
		onValueChange?: (value: string) => void;
		label?: string;
		placeholder?: string;
		icon?: any;
		class?: string;
	}

	// Define props with Svelte 5 syntax
	let {
		options,
		value = $bindable(),
		onValueChange,
		label = 'Select an option',
		placeholder = 'Search...',
		icon: Icon = undefined,
		class: className = ''
	}: ComboboxProps = $props();

	// Map between option values and full option objects
	const optionMap = $derived.by(() => {
		const map = new Map<number, OptionType>();
		options.forEach((option) => map.set(option.value, option));
		return map;
	});

	// Convert between string and number for internal/external use
	const getNumberValue = (val: string | undefined): number | undefined =>
		val !== undefined ? Number(val) : undefined;

	// Setup the combobox - Melt requires string type
	const combobox = new Combobox<string, false>({
		forceVisible: true,
		value: value
	});

	// Watch for value changes
	$effect(() => {
		if (combobox.value !== undefined && combobox.value !== value) {
			value = combobox.value;
			if (onValueChange) onValueChange(combobox.value);
		}
	});

	// Update combobox value when external value changes
	$effect(() => {
		if (value !== undefined && value !== combobox.value) {
			combobox.select(value);
		}
	});

	// Filter options using derived state
	const filtered = $derived.by(() => {
		if (!combobox.touched) return options;
		return options.filter((o) =>
			o.label.toLowerCase().includes(combobox.inputValue.trim().toLowerCase())
		);
	});

	// Get the label for the current value
	const selectedLabel = $derived.by(() => {
		if (value === undefined) return placeholder;
		const numValue = getNumberValue(value);
		const option = numValue !== undefined ? optionMap.get(numValue) : undefined;
		return option ? option.label : placeholder;
	});
</script>

<div class={cn('mx-auto flex w-[300px] flex-col gap-1', className)}>
	<label for={combobox.ids.input}>{label}</label>
	<div class="relative text-left text-gray-800 transition dark:text-gray-200">
		{#if Icon}
			<Icon class="abs-y-center absolute left-3 shrink-0" />
		{/if}
		<input
			{...combobox.input}
			class={cn(
				'w-full rounded-xl border border-gray-500 bg-gray-100 py-2 text-left',
				'focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50',
				'dark:bg-gray-900',
				Icon ? 'pl-9' : 'pl-3'
			)}
			type="text"
			{placeholder}
			value={selectedLabel}
		/>
		<button
			class="abs-y-center absolute right-3 grid shrink-0 place-items-center rounded-md
					dark:bg-gray-700 dark:hover:bg-gray-500 dark:active:bg-gray-600"
			{...combobox.trigger}
		>
			<PhCaretDown />
		</button>
	</div>
	<span class={['text-sm opacity-75', !value && 'pointer-events-none invisible']}>
		Selected: {selectedLabel}
	</span>

	<div
		{...combobox.content}
		class="flex flex-col rounded-xl border border-gray-500 bg-gray-100 p-2 shadow dark:bg-gray-800"
	>
		{#each filtered as option (option.value)}
			<div
				{...combobox.getOption(String(option.value))}
				class={[
					'relative flex items-center justify-between rounded-xl py-2 pr-2 pl-8',
					combobox.highlighted === String(option.value) && 'bg-gray-700',
					combobox.value === String(option.value) && 'font-semibold'
				]}
			>
				<span>{option.label}</span>
				{#if combobox.isSelected(String(option.value))}
					<Check class="text-accent-300 font-bold" />
				{/if}
			</div>
		{:else}
			<span class="opacity-50 py-2 pl-8 pr-2">No results found</span>
		{/each}
	</div>
</div>

<style>
	[data-melt-combobox-content] {
		position: absolute;
		pointer-events: none;
		opacity: 0;

		transform: scale(0.975);

		transition: 0.2s;
		transition-property: opacity, transform;
		transform-origin: var(--melt-popover-content-transform-origin, center);
	}

	[data-melt-combobox-content][data-open] {
		pointer-events: auto;
		opacity: 1;

		transform: scale(1);
	}

	.abs-y-center {
		top: 50%;
		transform: translateY(-50%);
	}
</style>
