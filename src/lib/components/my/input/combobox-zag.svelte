<script lang="ts">
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';

	const comboboxData = [
		{ id: 1, label: 'Banana' },
		{ id: 2, label: 'Apple' },
		{ id: 3, label: 'Orange' },
		{ id: 4, label: 'Grapes' },
		{ id: 5, label: 'Pineapple' },
		{ id: 6, label: 'Mango' },
		{ id: 7, label: 'Strawberry' },
		{ id: 8, label: 'Blueberry' },
		{ id: 9, label: 'Watermelon' },
		{ id: 10, label: 'Peach' }
		//...
	];

	let options = $state.raw(comboboxData);

	const collection = combobox.collection({
		items: comboboxData,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.id.toString()
	});

	const id = $props.id();
	const service = useMachine(combobox.machine, {
		id,
		collection,
		onOpenChange() {
			options = comboboxData;
		},
		onInputValueChange({ inputValue }) {
			const filtered = comboboxData.filter((item) =>
				item.label.toLowerCase().includes(inputValue.toLowerCase())
			);
			const newOptions = filtered.length > 0 ? filtered : comboboxData;

			collection.setItems(newOptions);
			options = newOptions;
		}
	});
	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<div {...api.getRootProps()}>
	<label {...api.getLabelProps()}>Select country</label>
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
