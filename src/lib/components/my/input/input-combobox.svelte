<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import { cn } from '$lib/utils';
	import PhList from '~icons/ph/list';
	import PhCaretDown from '~icons/ph/caret-down';
	import BaseInput from './input-base.svelte';

	type ComboboxItem = {
		value: string | number;
		label: string;
		[key: string]: any; // Allow additional properties
	};

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		items: ComboboxItem[]; // Array of items to select from
		value?: string | number | null; // ID of the selected item
		placeholder?: string;
		disabled?: boolean;
		error?: string;
		labelText?: string;
		inline?: boolean;
		class?: string;
	};

	let {
		ref = $bindable(null),
		items = [],
		value = $bindable(null), // This will be the ID
		placeholder = 'Select an option',
		disabled = false,
		error,
		labelText,
		inline = false,
		class: className = '',
		...restProps
	}: Props = $props();

	// Internal state
	let options = $state(items);
	let inputValue = $state('');
	let selectedItem = $state<ComboboxItem | null>(null);

	// Find the selected item based on value (ID)
	$effect(() => {
		if (value !== null && value !== undefined) {
			const item = items.find((item) => itemToValue(item) === String(value));
			selectedItem = item || null;
		} else {
			selectedItem = null;
		}
	});

	// Item handlers - fixed as per requirements
	const itemToString = (item: ComboboxItem) => item.label;
	const itemToValue = (item: ComboboxItem) => item.id.toString();

	// Create collection
	const collection = combobox.collection({
		items,
		itemToString,
		itemToValue
	});

	// Generate a unique ID for the combobox
	const comboboxId = restProps.id || `combobox-${Math.random().toString(36).slice(2, 11)}`;

	// Create machine
	const machine = useMachine(combobox.machine, {
		id: comboboxId,
		name: restProps.name || 'combobox',
		collection,
		onOpenChange() {
			options = items;
		},
		onInputValueChange({ inputValue: newInputValue }) {
			inputValue = newInputValue;

			const filtered = items.filter((item) =>
				itemToString(item).toLowerCase().includes(newInputValue.toLowerCase())
			);
			options = filtered.length > 0 ? filtered : items;
		},
		onValueChange(details) {
			if (details.value) {
				// details.value could be a string or array of strings
				const valueToFind = Array.isArray(details.value) ? details.value[0] : details.value;
				const item = items.find((item) => itemToValue(item) === valueToFind);
				if (item) {
					value = item.id;
					selectedItem = item;
				}
			} else {
				value = null;
				selectedItem = null;
			}
		}
	});

	const api = $derived(combobox.connect(machine, normalizeProps));

	// Update input value when selectedItem changes
	$effect(() => {
		if (selectedItem) {
			inputValue = itemToString(selectedItem);
		} else {
			inputValue = '';
		}
	});
</script>

{#snippet comboboxIcon()}
	<PhList />
{/snippet}

{#snippet comboboxContent()}
	<div class="w-full">
		<input
			bind:this={ref}
			value={inputValue}
			{placeholder}
			{disabled}
			name={restProps.name}
			onfocus={() => api.focus()}
			oninput={(e) => {
				api.setInputValue(e.currentTarget.value);
				// Dispatch input event for form integration
				const event = new Event('input', { bubbles: true });
				e.currentTarget.dispatchEvent(event);
			}}
			onclick={() => !api.open && api.setOpen(true)}
			class={cn(
				'peer flex h-full w-full items-center border-none ',
				'text-primary-foreground outline-none'
			)}
			{...restProps}
		/>
	</div>
{/snippet}

{#snippet comboboxActions()}
	<div class="ml-auto flex h-full items-center gap-1 text-muted-foreground">
		<button
			type="button"
			class="flex h-full items-center justify-center rounded-sm hover:text-primary-foreground"
			aria-label="Toggle options"
			onclick={() => api.setOpen(!api.open)}
		>
			<PhCaretDown />
		</button>
	</div>
{/snippet}

<!-- Container for proper dropdown positioning -->
<div class="relative">
	<!-- Styled combobox using BaseInput for consistent styling -->
	<BaseInput
		class={className}
		{error}
		{labelText}
		{inline}
		Icon={comboboxIcon}
		Content={comboboxContent}
		Action={comboboxActions}
	/>

	<!-- Dropdown section -->
	<div class="relative w-full">
		{#if api.open && options.length > 0}
			<div
				{...api.getContentProps()}
				class={cn(
					'absolute z-50 max-h-60 overflow-auto rounded-md border border-input bg-popover text-popover-foreground shadow-md',
					inline
						? 'top-0 right-0 left-[calc(120px+0.75rem)]'
						: 'top-[calc(100%+4px)] right-0 left-0'
				)}
			>
				<ul class="py-1">
					{#each options as item}
						{@const isSelected = value !== null && itemToValue(item) === String(value)}
						{@const itemState = api.getItemState({ item })}
						<li
							{...api.getItemProps({ item })}
							onclick={() => {
								api.selectValue(itemToValue(item));
								api.setOpen(false);
							}}
							class={cn(
								'relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
								isSelected && 'bg-primary text-primary-foreground',
								itemState.highlighted && 'bg-accent text-accent-foreground',
								!isSelected &&
									!itemState.highlighted &&
									'hover:bg-accent hover:text-accent-foreground'
							)}
						>
							{itemToString(item)}
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>

<!-- Original Zag combobox structure (hidden) -->
<div {...api.getRootProps()} class="sr-only">
	<label {...api.getLabelProps()}>Hidden label</label>
	<div {...api.getControlProps()}>
		<input {...api.getInputProps()} />
		<button {...api.getTriggerProps()}><PhCaretDown /></button>
	</div>
</div>
