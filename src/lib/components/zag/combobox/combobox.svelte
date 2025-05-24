<script lang="ts" generics="T extends ComboboxItem">
	import './combobox.css';
	import type { ComboboxProps, ComboboxItem } from './types.js';
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import { matchSorter } from 'match-sorter';

	import PhListPlus from '~icons/ph/list-plus';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhX from '~icons/ph/x';
	import PhCheck from '~icons/ph/check';
	import { cn } from '$lib/utils';

	let {
		name,
		items = [],
		value = $bindable(),
		placeholder = 'Select an item',
		label,
		...restProps
	}: ComboboxProps<T> = $props();

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
		placeholder,
		multiple: false,
		onOpenChange() {
			options = items;
		},
		onInputValueChange({ inputValue }) {
			const filtered = matchSorter(items, inputValue, {
				keys: ['label']
			});
			const newOptions = filtered.length > 0 ? filtered : items;
			collection.setItems(newOptions);
			options = newOptions;
		},
		onValueChange({ value: selectedValue }) {
			value = selectedValue.length > 0 ? parseInt(selectedValue[0]) : null;
			api.setValue(value ? [value.toString()] : []);
		},
		positioning: { strategy: 'fixed' },
		...restProps
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" {name} {value} />

<div {...api.getRootProps()}>
	<label {...api.getLabelProps()}>{label}</label>
	<div {...api.getControlProps()}>
		<div class="place-content-center text-muted-foreground"><PhListPlus /></div>
		<input {...api.getInputProps()} />
		<button {...api.getTriggerProps()}>
			<PhCaretDown class="transition-transform {api.open && 'rotate-180'}" />
		</button>
	</div>
</div>
<div {...api.getPositionerProps()}>
	{#if options.length > 0}
		<ul {...api.getContentProps()}>
			{#each options as item (item.value)}
				{@const state = api.getItemState({ item })}
				<li {...api.getItemProps({ item })} class="flex justify-between">
					<span> {item.label}</span>
					{#if state.selected}
						<span><PhCheck /></span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
