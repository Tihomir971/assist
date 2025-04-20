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
	};

	let {
		name,
		value = $bindable(undefined),
		items,
		labelText,
		placeholder = '',
		required,
		readonly = false
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

<input type="hidden" {name} value={value?.toString() || ''} />

<div {...api.getRootProps()} class="flex flex-col gap-1">
	<!-- <BaseInput bind:rootElement={baseInputRootElement} {Icon} {Action} {labelText} /> -->
	<label {...api.getLabelProps()} class="text-sm data-disabled:opacity-5">{labelText}</label>
	<!-- [data-scope="combobox"][data-part="control"] -->
	<div {...api.getControlProps()} class="relative w-full">
		<div
			class="pointer-events-none absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground"
		>
			<PhListPlus />
		</div>
		<div
			class="inline-flex h-10 w-full truncate rounded-sm border border-surface-2 bg-surface-document px-8 text-base ring-primary transition-colors placeholder:text-muted-foreground focus-within:border-primary focus-within:ring hover:border-surface-3 sm:text-sm"
		>
			<input type="number" {...api.getInputProps()} class="w-full focus:outline-none" />
		</div>
		<button
			{...api.getTriggerProps()}
			class="absolute end-2 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground"
		>
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
				'isolate z-50 m-0 max-h-56 list-none overflow-auto overscroll-contain border border-surface-2 bg-surface-document p-1',
				'rounded-sm border border-muted bg-popover shadow-popover outline-hidden select-none'
			)}
		>
			{#each options as item}
				{@const state = api.getItemState({ item })}
				<li
					{...api.getItemProps({ item })}
					class="flex cursor-pointer items-center gap-2 px-2 py-1 select-none data-disabled:cursor-auto data-disabled:opacity-5 data-highlighted:bg-surface-1 data-highlighted:hover:bg-surface-1"
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
	/* [data-scope='combobox'][data-part='root'] {
		display: inline-flex;
		flex-direction: column;
	} */

	/* 	[data-scope='combobox'][data-part='content'] {
		background-color: var(--color-surface-document);
		list-style-type: none;
		margin: 0;
		border: 1px solid var(--color-surface-2);
		overscroll-behavior: contain;
		max-height: 240px;
		overflow: auto;
		padding: 2px;
		z-index: 50;
	} */

	/* 	[data-scope='combobox'][data-part='item'] {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		user-select: none;
		user-select: none;
		content-visibility: auto;

		&[data-highlighted] {
			background-color: var(--color-surface-1);
			color: white;
		}

		&[data-disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}
	} */

	/* 	[data-scope='combobox'][data-part='label'] {
		display: block;
		margin-top: 12px;
		margin-bottom: 4px;
	} */

	/* 	[data-scope='combobox'][data-part='control'] {
		display: inline-flex;
		width: 300px;
	} */

	/* 	[data-scope='combobox'][data-part='input'] {
		flex: 1;
	} */

	/* [data-scope='combobox'][data-part='clear-trigger'] {
		display: inline-flex;
		font-size: 1.2em;
		& svg {
			width: 1em;
			height: 1em;
		}
	} */

	/* 	[data-scope='combobox'][data-part='item-group-label'] {
		user-select: none;
		margin-top: 8px;
		display: flex;
		align-items: center;
		padding: 0 8px 8px;
		font-size: 12px;
		font-weight: 600;
	} */
</style>
