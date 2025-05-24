<script lang="ts" generics="T extends ComboboxItem">
	import * as combobox from '@zag-js/combobox';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import { filterOptions, findOptionByValue } from '../core/utils.js';
	import PhX from '~icons/ph/x';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhCheck from '~icons/ph/check';
	import type { ComboboxItem, ComboboxProps } from './types.js';
	import { matchSorter } from 'match-sorter';

	let localIdCounter = 0;
	const generateLocalId = (prefix: string) => `${prefix}-${localIdCounter++}`;

	let {
		id: explicitId,
		name,
		disabled = false,
		required = false,
		invalid = false,
		value = $bindable(),
		options = [],
		placeholder = 'Select an option...',
		readonly = false,
		allowCustomValue = false,
		closeOnSelect = true,
		onValueChange
	}: ComboboxProps<T> = $props();

	const effectiveId = $derived(explicitId ?? generateLocalId('ecb-'));

	let filteredOptions = $state.raw(options);
	const collection = $derived(
		combobox.collection({
			items: options,
			itemToValue: (item) => item.value.toString(),
			itemToString: (item) => item.label,
			isItemDisabled(item) {
				return item.disabled || false;
			}
		})
	);

	const service = useMachine(combobox.machine, {
		get id() {
			return effectiveId;
		},
		get name() {
			return name;
		},
		get collection() {
			return collection;
		},
		defaultValue: value != null ? [value.toString()] : undefined,
		get value() {
			return value != null ? [value.toString()] : undefined;
		},
		placeholder,
		disabled,
		readOnly: readonly,
		multiple: false,
		required,
		invalid,
		allowCustomValue,
		closeOnSelect,
		onOpenChange() {
			filteredOptions = options;
		},
		onInputValueChange({ inputValue }: { inputValue: string }) {
			const filtered = matchSorter(options, inputValue, {
				keys: ['label']
			});
			const newOptions = filtered.length > 0 ? filtered : options;
			collection.setItems(newOptions);
			options = newOptions;
		},
		onValueChange({ value: selectedValues }: { value: string[] }) {
			const inputValue = selectedValues?.[0];
			let processedValue: number | null = null;
			if (inputValue && inputValue.trim() !== '') {
				const parsedNumber = parseInt(inputValue, 10);
				if (!isNaN(parsedNumber)) {
					processedValue = parsedNumber;
				}
			}
			value = processedValue;
		}
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<div>
	<div {...api.getRootProps()}>
		<div {...api.getControlProps()}>
			<input {...api.getInputProps()} />

			{#if value !== null && !disabled && !readonly}
				<button {...api.getClearTriggerProps()} type="button" aria-label="Clear selection">
					<PhX />
				</button>
			{/if}

			<button {...api.getTriggerProps()} type="button" aria-label="Toggle options">
				<PhCaretDown />
			</button>
		</div>

		{#if api.open}
			<div {...api.getPositionerProps()}>
				<ul {...api.getContentProps()}>
					{#each collection.items as item (item.value)}
						<li {...api.getItemProps({ item })} data-disabled={item.disabled}>
							<span {...api.getItemTextProps({ item })}>
								{item.label}
							</span>
							{#if api.getItemState({ item }).selected}
								<span {...api.getItemIndicatorProps({ item })}><PhCheck /></span>
							{/if}
						</li>
					{/each}

					{#if collection.items.length === 0}
						<li class="no-options">No options found</li>
					{/if}
				</ul>
			</div>
		{/if}
	</div>
</div>

<style>
	.no-options {
		padding: 0.75rem;
		text-align: center;
		color: var(--color-text-muted, #9ca3af);
		font-size: 0.875rem;
		list-style: none;
	}
</style>
