<script lang="ts" generics="T extends SelectItem">
	import './select.css';
	import * as select from '@zag-js/select';
	import { normalizeProps, portal, useMachine } from '@zag-js/svelte';
	import type { SelectItem, SelectProps2 } from './types';
	import PhX from '~icons/ph/x';
	import PhCaretDown from '~icons/ph/caret-down';

	let {
		id,
		name,
		value = $bindable(),
		items = [],
		label,
		disabled,
		placeholder = 'Select ...',
		readOnly,
		required,
		onValueChange,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-required': ariaRequired
	}: SelectProps2<T> = $props();

	const collection = $derived(
		select.collection({
			items,
			itemToValue: (item) => item.value.toString(),
			itemToString: (item) => item.label,
			isItemDisabled(item) {
				return item.disabled || false;
			}
		})
	);
	const localId = $props.id();
	const service = useMachine(select.machine, {
		id: id ?? localId,
		name,
		get collection() {
			return collection;
		},
		defaultValue: value != null ? [value.toString()] : [],
		get value() {
			return value != null ? [value.toString()] : [];
		},
		disabled,
		deselectable: true,
		invalid: ariaInvalid === 'true',
		readOnly,
		required: required || ariaRequired === 'true',
		onValueChange(valueChangeDetails) {
			if (valueChangeDetails.items.length === 0 || valueChangeDetails.items == null) {
				value = null;
			} else {
				value = valueChangeDetails.items[0].value;
			}
			if (onValueChange) {
				onValueChange(valueChangeDetails);
			}
		}
	});

	const api = $derived(select.connect(service, normalizeProps));
</script>

<div {...api.getRootProps()}>
	{#if label}
		<div class="flex items-center justify-between">
			<label
				{...api.getLabelProps()}
				class="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{label}
				{#if required || ariaRequired === 'true'}
					<span class="text-warning">*</span>
				{/if}
			</label>
			<button {...api.getClearTriggerProps()}><PhX class="text-xs" /></button>
		</div>
	{/if}

	<div {...api.getControlProps()}>
		<button
			{...api.getTriggerProps()}
			class="flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
		>
			<span class={api.valueAsString ? '' : 'text-muted-foreground'}>
				{api.valueAsString || placeholder}
			</span>
			<span {...api.getIndicatorProps()}><PhCaretDown /></span>
		</button>
	</div>

	<select {...api.getHiddenSelectProps()}>
		{#each items as option}
			<option value={option.value}>
				{option.label}
			</option>
		{/each}
	</select>

	<div use:portal {...api.getPositionerProps()}>
		<ul {...api.getContentProps()}>
			{#each items as item}
				<li {...api.getItemProps({ item })}>
					<span {...api.getItemTextProps({ item })}>{item.label}</span>
					<span {...api.getItemIndicatorProps({ item })}>✓</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
