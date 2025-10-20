<script lang="ts" generics="T extends ComboboxItem">
	import './combobox.css';
	import * as combobox from '@zag-js/combobox';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import PhX from '~icons/ph/x';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhCheck from '~icons/ph/check';
	import PhListDashes from '~icons/ph/list-dashes';
	import type { ComboboxItem, ComboboxProps } from './types.js';
	import { matchSorter } from 'match-sorter';

	let {
		id,
		name,
		value = $bindable(),
		items = [],
		label,
		placeholder = 'Select an option...',
		disabled,
		onValueChange,
		readOnly,
		required,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-required': ariaRequired
	}: ComboboxProps<T> = $props();

	let filteredOptions = $state.raw(items);
	const collection = $derived(
		combobox.collection({
			items: filteredOptions,
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
			filteredOptions = newOptions;
		},
		onValueChange(details) {
			if (details.items.length === 0 || details.items == null) {
				value = null;
				return;
			}
			value = details.items[0].value;
			if (onValueChange) {
				onValueChange(details);
			}
		}
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" {name} {value} />

<div {...api.getRootProps()}>
	{#if label}
		<label
			{...api.getLabelProps()}
			class="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{label}
			{#if required || ariaRequired === 'true'}
				<span class="text-warning">*</span>
			{/if}
		</label>
	{/if}
	<div
		{...api.getControlProps()}
		class="inline-flex h-9 shrink-0 items-center justify-between gap-1 rounded-md border bg-background px-3 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 has-[>svg]:px-3 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
	>
		<input {...api.getInputProps()} aria-describedby={ariaDescribedBy} />
		<div class="">
			{#if value !== null && !disabled && !readOnly}
				<button {...api.getClearTriggerProps()} type="button" aria-label="Clear selection">
					<PhX />
				</button>
			{/if}

			<button {...api.getTriggerProps()} type="button" aria-label="Toggle options">
				<PhCaretDown />
			</button>
		</div>
	</div>

	{#if api.open}
		<div {...api.getPositionerProps()}>
			<ul
				{...api.getContentProps()}
				class="z-50 flex h-full max-h-56 flex-col overflow-hidden rounded-md border bg-popover p-0 text-sm text-popover-foreground shadow-sm outline-hidden"
			>
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
