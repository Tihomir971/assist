<script lang="ts" generics="T extends SelectItem">
	import './select.css';
	import * as select from '@zag-js/select';
	import { normalizeProps, portal, useMachine } from '@zag-js/svelte';
	import type { SelectItem, SelectPropsLookup } from './types';
	import PhX from '~icons/ph/x';
	import PhCaretDown from '~icons/ph/caret-down';
	import CheckIcon from '@lucide/svelte/icons/check';

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
	}: SelectPropsLookup<T> = $props();

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

<div {...api.getRootProps()} class="grid gap-2">
	{#if label}
		<div class="flex items-center justify-between">
			<label
				{...api.getLabelProps()}
				class="flex items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{label}
				{#if required || ariaRequired === 'true'}
					<span class="text-warning">*</span>
				{/if}
			</label>
			<button {...api.getClearTriggerProps()}>
				<PhX class="text-xs" />
			</button>
		</div>
	{/if}

	<div {...api.getControlProps()}>
		<button
			{...api.getTriggerProps()}
			class="flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground shadow-sm focus:ring-1 focus:ring-ring focus:outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
		>
			<span class={api.valueAsString ? '' : 'text-muted-foreground'}>
				{api.valueAsString || placeholder}
			</span>
			<span {...api.getIndicatorProps()} class="h-4 w-4 opacity-50"><PhCaretDown /></span>
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
		<ul
			{...api.getContentProps()}
			class="z-50 max-h-60 min-w-(--reference-width) overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
		>
			{#each items as item}
				<li
					{...api.getItemProps({ item })}
					class="relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm text-accent-foreground select-none data-highlighted:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-accent"
				>
					<span {...api.getItemTextProps({ item })}>{item.label}</span>
					<span
						{...api.getItemIndicatorProps({ item })}
						class="absolute right-2 items-center justify-center"
					>
						<CheckIcon class="size-3.5" />
					</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
