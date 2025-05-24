<script lang="ts" module>
	import type { ComboboxProps } from '../core/types.js';

	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import * as combobox from '@zag-js/combobox';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import { getContext } from 'svelte';
	import type { FormFieldContext } from '../core/types.js';
	import { filterOptions, findOptionByValue } from '../core/utils.js';
	import PhX from '~icons/ph/x';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhCheck from '~icons/ph/check';
	import { cn } from '$lib/utils.js';

	type Props = ComboboxProps<T>;

	let {
		// Superforms props (optional)
		form = undefined,
		name = undefined, // This is the name prop passed to Combobox

		// Standalone props (optional)
		value = $bindable(),

		// Common props
		options,
		label,
		placeholder = 'Select an option...',
		disabled = false,
		readonly = false,
		required = false,
		allowCustomValue = false,
		closeOnSelect = true,

		// Error handling for standalone mode
		invalid = false,
		errors = [],

		// Event handlers for standalone mode
		onValueChange,
		onSelectionChange,

		// CSS classes
		class: className = '',

		...restProps
	}: Props = $props();

	// Try to get form context
	const formContext = getContext<FormFieldContext>('form-field');
	const isFormMode = !!formContext?.isFormMode;

	// Determine the name to use for the machine and hidden input
	const machineName = $derived(isFormMode ? formContext.name : name);

	// Simple error handling
	const currentErrors = $derived(
		isFormMode ? formContext.currentErrors : errors.length > 0 ? errors : undefined
	);
	const isInvalid = $derived(isFormMode ? !!currentErrors?.length : invalid);
	const isRequired = $derived(isFormMode ? !!formContext.currentConstraints?.required : required);

	// Use $state.raw to avoid unnecessary reactivity like in your working example
	let filteredOptions = $state.raw(options);

	// Create collection using your proven pattern
	const collection = $derived(
		combobox.collection({
			items: filteredOptions.map((opt) => ({
				label: opt.label,
				value: opt.value.toString(),
				disabled: opt.disabled
			})),
			itemToValue: (item) => item.value,
			itemToString: (item) => item.label
		})
	);

	// Zag combobox machine using your successful pattern
	const id = $props.id();
	const service = useMachine(combobox.machine, {
		id,

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
		get required() {
			return isRequired;
		},
		get invalid() {
			return isInvalid;
		},
		allowCustomValue,
		closeOnSelect,
		onOpenChange() {
			filteredOptions = options;
		},
		onInputValueChange({ inputValue }: { inputValue: string }) {
			const filtered = filterOptions(options, inputValue);
			const newOptions = filtered.length > 0 ? filtered : options;
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
				// If inputValue is non-empty but not a number (e.g., "abc"), processedValue remains null.
			}
			// Update value
			value = processedValue;

			// Update form context if in form mode
			if (isFormMode && formContext.fieldProxy) {
				formContext.fieldProxy.value.set(processedValue);
			}

			// Call event handlers
			if (onValueChange) {
				onValueChange(processedValue);
			}
			if (onSelectionChange) {
				const option = findOptionByValue(options, processedValue);
				onSelectionChange(option || null);
			}
		}
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" name={machineName} {value} />

<div class={cn('combobox-wrapper', className)} {...restProps}>
	<div {...api.getRootProps()}>
		{#if label}
			<label {...api.getLabelProps()} class={cn(isRequired && 'form-label-required')}>
				{label}
			</label>
		{/if}

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

	<!-- Error display -->
	<div class="form-error min-h-[15px]">
		{#if currentErrors && currentErrors.length > 0}
			{currentErrors.join(', ')}
		{/if}
	</div>
</div>

<style>
	.combobox-wrapper {
		position: relative;
		width: 100%;
	}

	.no-options {
		padding: 0.75rem;
		text-align: center;
		color: var(--color-text-muted, #9ca3af);
		font-size: 0.875rem;
		list-style: none;
	}
</style>
