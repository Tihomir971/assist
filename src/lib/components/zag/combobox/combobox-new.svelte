<script lang="ts">
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import type { FormFieldProxy } from 'sveltekit-superforms';
	import type { ComboboxItem, ComboboxProps, ComboboxProps2 } from './types.js';
	import { matchSorter } from 'match-sorter';

	interface Props extends ComboboxProps2<ComboboxItem>, FormFieldProxy<number | null> {}

	let { value = $bindable(), items = [], label, placeholder, ...formProps }: Props = $props();
	$inspect('formProps', formProps);
	$inspect('value', value);

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
		defaultValue: $value ? [$value.toString()] : undefined,
		get value() {
			return $value ? [$value.toString()] : undefined;
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
			options = newOptions;
		},
		onValueChange({ value: selectedValue }) {
			$value = selectedValue.length > 0 ? parseInt(selectedValue[0]) : null;
		}
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" name={formProps.path} value={$value} />

<div {...api.getRootProps()}>
	<label {...api.getLabelProps()}>{label}</label>
	<div {...api.getControlProps()}>
		<input {...api.getInputProps()} />
		<button {...api.getTriggerProps()}>▼</button>
	</div>
</div>
<div {...api.getPositionerProps()}>
	{#if options.length > 0}
		<ul {...api.getContentProps()}>
			{#each options as item}
				<li {...api.getItemProps({ item })}>{item.label}</li>
			{/each}
		</ul>
	{/if}
</div>
