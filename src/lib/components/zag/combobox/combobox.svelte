<script lang="ts" generics="T extends ComboboxItem">
	import type { ComboboxProps, ComboboxItem } from './types.js';

	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import { matchSorter } from 'match-sorter';

	import PhListPlus from '~icons/ph/list-plus';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhX from '~icons/ph/x';

	import { cn } from '$lib/utils';

	// type Props = {
	// 	items: ComboboxItem[];
	// 	value?: number | null;
	// 	name?: string | undefined;
	// 	required?: boolean | undefined;
	// 	disabled?: boolean;
	// 	readonly?: boolean;
	// 	invalid?: boolean;
	// 	placeholder?: string;
	// 	label?: string;
	// 	inline?: boolean;
	// };

	let {
		name,
		items = [],
		value = $bindable(),
		required = false,
		disabled = false,
		readOnly = false,
		invalid = false,
		placeholder = 'Select an item',
		label,
		inline
	}: ComboboxProps<T> = $props();

	let options = $state.raw(items);
	const collection = $derived(
		combobox.collection({
			items: options,
			itemToValue: (item) => item.value.toString(),
			itemToString: (item) => item.label
		})
	);
	const id = $props.id();
	const service = useMachine(combobox.machine, {
		id,
		get collection() {
			return collection;
		},
		get defaultValue() {
			return value ? [value.toString()] : undefined;
		},
		get value() {
			return value ? [value.toString()] : undefined;
		},
		required,
		disabled: disabled,
		readOnly,
		placeholder: placeholder,
		invalid: invalid,
		multiple: false,
		onOpenChange() {
			options = items;
		},
		onInputValueChange({ inputValue }) {
			const filtered = matchSorter(items, inputValue, {
				keys: ['label']
			});
			const newOptions = filtered.length > 0 ? filtered : items;
			collection.setItems(newOptions);
			options = newOptions;
		},
		onValueChange({ value: selectedValue }) {
			console.log('selectedValue', selectedValue);
			value = selectedValue.length > 0 ? parseInt(selectedValue[0]) : null;
			console.log('value', value);
		}
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" {name} {value} />

<div {...api.getRootProps()} class="input-root">
	<div class="flex h-6 items-center justify-between">
		<div>
			{#if label}
				<label {...api.getLabelProps()} class="input-label">{label}</label>
			{/if}
			{#if required}
				<span class="text-warning">*</span>
			{/if}
		</div>
		{#if !required && !readOnly && api.value.length > 0}
			<button
				{...api.getClearTriggerProps()}
				class="mr-2 flex aspect-square h-full items-center justify-center text-xs hover:text-base"
			>
				<PhX />
			</button>
		{/if}
	</div>
	<div {...api.getControlProps()} class="input-control">
		{#if invalid}
			<!-- Placeholder for potential error message display -->
		{/if}
		<div class="input-icon">
			<PhListPlus />
		</div>
		<div class="input-input">
			<input {...api.getInputProps()} class="w-full focus:outline-none" />
		</div>

		<button {...api.getTriggerProps()} class="input-trigger">
			{#if readOnly}
				<PhPencilSimpleSlash />
			{:else}
				<PhCaretDown class={cn('transition-transform', api.open && 'rotate-180')} />
			{/if}
		</button>
	</div>
</div>
<div {...api.getPositionerProps()}>
	{#if options.length > 0}
		<ul
			{...api.getContentProps()}
			class={cn(
				'isolate z-50 m-0 max-h-56 list-none overflow-auto overscroll-contain border border-border p-1',
				'rounded-sm border border-muted bg-popover shadow-popover outline-hidden select-none'
			)}
		>
			{#each options as item (item.value)}
				{@const state = api.getItemState({ item })}
				<li
					{...api.getItemProps({ item })}
					class="flex cursor-pointer items-center px-2 py-1 data-highlighted:rounded-sm data-highlighted:bg-accent"
				>
					<span>{item.label}</span>
					{#if state.selected}
						<span class="ml-auto pl-2">✓</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	[data-scope='combobox'][data-part='item'][data-highlighted] {
		background: var(--color-accent);
		color: #ffffff;
	}

	[data-scope='combobox'][data-part='item'][data-disabled] {
		opacity: 0.5;
		cursor: unset;
	}
</style>
