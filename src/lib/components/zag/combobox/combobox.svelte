<script lang="ts">
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import PhListPlus from '~icons/ph/list-plus';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import PhCaretDown from '~icons/ph/caret-down';
	import { cn } from '$lib/utils';
	import { matchSorter } from 'match-sorter';
	import PhX from '~icons/ph/x';

	type Item = { value: number; label: string };

	type Props = {
		name?: string | undefined;
		value?: number | null;
		items: Item[];
		labelText?: string;
		placeholder?: string;
		required?: boolean | undefined;
		readonly?: boolean;
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

	const collection = $derived(
		combobox.collection({
			items: options,
			itemToValue: (item) => item.value.toString(),
			itemToString: (item) => item.label
		})
	);

	const id = $props.id();
	const service = useMachine(combobox.machine, {
		id,
		get collection() {
			return collection;
		},
		defaultValue: value ? [value.toString()] : undefined,
		get value() {
			return value ? [value.toString()] : undefined;
		},
		placeholder: placeholder,
		multiple: false,
		onOpenChange() {
			options = items;
		},
		onInputValueChange({ inputValue }) {
			const filtered = matchSorter(items, inputValue, {
				keys: ['label']
			});
			/* const filtered = items.filter((item) =>
				item.label.toLowerCase().includes(inputValue.toLowerCase())
			); */
			const newOptions = filtered.length > 0 ? filtered : items;

			collection.setItems(newOptions);
			options = newOptions;
		},
		onValueChange({ value: selectedValue }) {
			value = selectedValue.length > 0 ? parseInt(selectedValue[0]) : null;
		}
		//onSelect({ value: selectedValue, itemValue }) {
		//	console.log('onSelect', selectedValue, itemValue, value);
		//	if (value && selectedValue.includes(value.toString())) {
		//		console.log('True', selectedValue, itemValue, value);
		//		api.clearValue(itemValue);
		//		console.log('True End', selectedValue, itemValue, value);
		//	} else {
		//		// console.log('False');
		//		// api.setValue([itemValue]);
		//	}
		//	value = parseInt(selectedValue[0]);
		//	console.log('onSelect End', selectedValue, itemValue, value);
		//}
	});
	const api = $derived(combobox.connect(service, normalizeProps));
	$inspect('Api:', api.value);
	//$inspect('Value:', value);
</script>

<input type="hidden" {name} value={api.value[0]} />

<div {...api.getRootProps()} class="input-root">
	<div class="flex items-center justify-between">
		<label {...api.getLabelProps()} class="input-label">
			{labelText}
			{#if required}
				<span class="text-warning">*</span>
			{/if}
		</label>
		<button {...api.getClearTriggerProps()} class="text-xs"><PhX /></button>
	</div>
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
				'isolate z-50 m-0 max-h-56 list-none overflow-auto overscroll-contain border border-border p-1',
				'rounded-sm border border-muted bg-popover shadow-popover outline-hidden select-none'
			)}
		>
			{#each options as item (item.value)}
				{@const state = api.getItemState({ item })}
				<li
					{...api.getItemProps({ item })}
					class="flex cursor-pointer items-center px-2 py-1 data-highlighted:rounded-sm data-highlighted:bg-accent"
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
	/*	[data-scope='combobox'][data-part='root'] {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	} */

	/* [data-scope='combobox'][data-part='label'] {
		font-size: 1.125rem;
	} */

	/* [data-scope='combobox'][data-part='label'][data-disabled] {
		opacity: 0.6;
	} */

	/* [data-scope='combobox'][data-part='control'] {
		display: inline-flex;
		width: 300px;
		background: var(--colors-bg-subtle);
		border-width: 1px;
		padding-block: 0.25rem;
		padding-inline: 0.75rem;
	} */

	/* [data-scope='combobox'][data-part='control'][data-disabled] {
		opacity: 0.6;
	} */

	/* 	[data-scope='combobox'][data-part='input'] {
		background: var(--colors-bg-subtle);
		flex: 1;
		padding: 0.25rem;
	} */

	/* 	[data-scope='combobox'][data-part='input']:focus {
		outline: 0;
	} */

	/* 	[data-scope='combobox'][data-part='content'] {
		list-style-type: none;
		margin: 0px;
		max-height: 14rem;
		overflow: auto;
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px 0 rgba(0, 0, 0, 0.06);
		isolation: isolate;
		padding: 0.5rem;
		background: var(--colors-bg-subtle);
	} */

	/* [data-scope='combobox'][data-part='item'] { */
	/* padding-inline: 0.5rem; */
	/* padding-block: 0.25rem; */
	/* display: flex; */
	/* align-items: center; */
	/* cursor: pointer; */
	/* } */

	[data-scope='combobox'][data-part='item'][data-highlighted] {
		background: var(--color-accent);
		color: #ffffff;
	}

	/* [data-scope='combobox'][data-part='item'][data-highlighted]:hover {
		background: var(--color-accent);
	} */

	[data-scope='combobox'][data-part='item'][data-disabled] {
		opacity: 0.5;
		cursor: unset;
	}
</style>
