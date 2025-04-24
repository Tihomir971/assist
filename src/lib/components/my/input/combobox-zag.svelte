<script lang="ts">
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import PhListPlus from '~icons/ph/list-plus';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import PhCaretDown from '~icons/ph/caret-down';
	import { cn } from '$lib/utils';

	// Reference to the BaseInput's root element for anchoring
	let baseInputRootElement: HTMLDivElement | null = $state(null);

	type Item = { value: number; label: string };

	type Props = {
		name?: string | undefined; // Name of the input field
		value?: number | null; // ID of the selected item
		items: Item[]; // List of items to display in the combobox
		labelText?: string; // Label for the input field
		placeholder?: string; // Placeholder text for the input field
		required?: boolean | undefined; // Placeholder text for the input field
		readonly?: boolean; // If true, the input is read-only
		inline?: boolean;
	};

	let {
		name,
		value = $bindable(undefined),
		items,
		labelText,
		placeholder = 'Select an item',
		required,
		readonly = false,
		inline = false
	}: Props = $props();

	let options = $state.raw(items);

	const collection = combobox.collection({
		items: items,
		itemToValue(item) {
			return item.value.toString();
		},
		itemToString(item) {
			return item.label;
		}
	});
	const id = $props.id();
	const service = useMachine(combobox.machine, {
		id: id,
		collection,
		defaultValue: value ? [value.toString()] : undefined,
		placeholder: placeholder,
		onOpenChange() {
			options = items;
		},
		onInputValueChange({ inputValue }) {
			const filtered = items.filter((item) =>
				item.label.toLowerCase().includes(inputValue.toLowerCase())
			);
			const newOptions = filtered.length > 0 ? filtered : items;

			collection.setItems(newOptions);
			options = newOptions;
		},
		onValueChange({ value: selectedValue }) {
			value = parseInt(selectedValue[0]);
		}
	});
	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" {name} value={api.value[0]} />

<div {...api.getRootProps()} class="input-root">
	<label {...api.getLabelProps()} class="input-label">{labelText}</label>
	<div {...api.getControlProps()} class="input-control">
		<div class="input-icon">
			<PhListPlus />
		</div>
		<div class="input-input">
			<input {...api.getInputProps()} class="w-full focus:outline-none" />
		</div>
		<button {...api.getTriggerProps()} class="input-trigger">
			{#if readonly}
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
				'isolate z-50 m-0 max-h-56 list-none overflow-auto overscroll-contain border border-surface-2 p-1',
				'rounded-sm border border-muted bg-well-1 shadow-popover outline-hidden select-none'
			)}
		>
			{#each options as item (item.value)}
				{@const state = api.getItemState({ item })}
				<li
					{...api.getItemProps({ item })}
					class="flex cursor-pointer items-center gap-2 px-2 py-1 select-none data-disabled:cursor-auto data-disabled:opacity-5 data-highlighted:bg-surface-1 data-highlighted:hover:bg-surface-2"
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
