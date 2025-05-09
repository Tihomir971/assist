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

	let {
		name,
		items = [],
		value = $bindable(),
		placeholder = 'Select an item',
		label,
		inline,
		...restProps
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
		defaultValue: value ? [value.toString()] : undefined,
		get value() {
			return value ? [value.toString()] : undefined;
		},
		placeholder,
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
			value = selectedValue.length > 0 ? parseInt(selectedValue[0]) : null;
			api.setValue(value ? [value.toString()] : []);
		},
		positioning: { strategy: 'fixed' },
		...restProps
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" {name} {value} />

<div {...api.getRootProps()} class="input-root">
	{#if label}
		<label {...api.getLabelProps()} class="input-label">
			{label}
			{#if restProps.required}
				<span class="text-warning">*</span>
			{/if}
		</label>
	{/if}
	<div {...api.getControlProps()} class="input-control">
		<div class="input-icon">
			<PhListPlus />
		</div>
		<div class="input-input">
			<input {...api.getInputProps()} class="w-full focus:outline-none" />
		</div>
		<div class="input-trigger">
			{#if restProps.readOnly}
				<PhPencilSimpleSlash />
			{:else}
				{#if !restProps.required && !restProps.readOnly && value}
					<button {...api.getClearTriggerProps()}>
						<PhX font-size="12px" />
					</button>
				{/if}
				<button {...api.getTriggerProps()}>
					<PhCaretDown class={cn('transition-transform', api.open && 'rotate-180')} />
				</button>
			{/if}
		</div>
	</div>
</div>
<div {...api.getPositionerProps()}>
	{#if options.length > 0}
		<ul {...api.getContentProps()} class="content-props">
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
