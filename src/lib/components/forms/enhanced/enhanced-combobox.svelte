<script lang="ts" generics="T extends ComboboxItem">
	import './styles.css';
	import * as combobox from '@zag-js/combobox';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import PhX from '~icons/ph/x';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhCheck from '~icons/ph/check';
	import type { ComboboxItem, ComboboxProps } from './types.js';
	import { matchSorter } from 'match-sorter';

	let {
		id,
		name,
		value = $bindable(),
		items = [],
		placeholder = 'Select an option...',
		disabled,
		readOnly,
		required,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-required': ariaRequired
	}: ComboboxProps<T> = $props();

	let filteredOptions = $state.raw(items);
	const collection = $derived(
		combobox.collection({
			items: items,
			itemToValue: (item) => item.value.toString(),
			itemToString: (item) => item.label,
			isItemDisabled(item) {
				return item.disabled || false;
			}
		})
	);

	const service = useMachine(combobox.machine, {
		id,
		get collection() {
			return collection;
		},
		defaultValue: value != null ? [value.toString()] : [],
		get value() {
			return value != null ? [value.toString()] : [];
		},
		placeholder,
		multiple: false,
		disabled,
		invalid: ariaInvalid === 'true',
		readOnly,
		required: required || ariaRequired === 'true',
		onOpenChange() {
			filteredOptions = items;
		},
		onInputValueChange({ inputValue }: { inputValue: string }) {
			const filtered = matchSorter(items, inputValue, {
				keys: ['label']
			});
			const newOptions = filtered.length > 0 ? filtered : items;
			collection.setItems(newOptions);
			filteredOptions = newOptions;
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

<input type="hidden" {name} {value} />

<div {...api.getRootProps()}>
	<div {...api.getControlProps()}>
		<input {...api.getInputProps()} aria-describedby={ariaDescribedBy} />

		{#if value !== null && !disabled && !readOnly}
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

<style>
	.no-options {
		padding: 0.75rem;
		text-align: center;
		color: var(--color-text-muted, #9ca3af);
		font-size: 0.875rem;
		list-style: none;
	}
</style>
