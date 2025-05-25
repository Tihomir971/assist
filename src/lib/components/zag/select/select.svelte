<script lang="ts" generics="T extends SelectItem2">
	import './select.css';
	import * as select from '@zag-js/select';
	import { normalizeProps, portal, useMachine } from '@zag-js/svelte';
	import type { SelectItem2, SelectProps2 } from './types';
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
			console.log('valueChangeDetails', valueChangeDetails);
			if (valueChangeDetails.items.length === 0 || valueChangeDetails.items == null) {
				value = null;
				return;
			}
			value = valueChangeDetails.items[0].value;
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
			<label {...api.getLabelProps()}>{label}</label>
			<button {...api.getClearTriggerProps()}><PhX /></button>
		</div>
	{/if}

	<div {...api.getControlProps()}>
		<button {...api.getTriggerProps()}>
			<span class={api.valueAsString ? '' : 'text-ink-dim'}>
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
