<script lang="ts">
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	// const comboboxData = [
	// 	{ label: 'Zambia', code: 'ZA' },
	// 	{ label: 'Benin', code: 'BN' }
	// 	//...
	// ];
	type Item = { value: number; label: string };

	type Props = {
		name?: string | undefined; // Name of the input field
		value?: number | null; // ID of the selected item
		items: Item[]; // List of items to display in the combobox
		labelText?: string; // Label for the input field
		placeholder?: string; // Placeholder text for the input field
		required?: boolean | undefined; // Placeholder text for the input field
	};

	let { name, value = $bindable(undefined), items, placeholder = '', required }: Props = $props();

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
	$inspect('value', value, typeof value);
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
			// Update the Svelte state (bindable prop)
			const selectedId = parseInt(selectedValue[0]);
			value = selectedId;

			// Explicitly set the Zag.js machine's input value to the ID string.
			// This should make the <input {...api.getInputProps()} /> render with the ID as its value.
			// We use the ID string here because the input's value attribute expects a string.
			// Superforms/Zod will parse this string back to a number on the server.
			/* if (selectedValue.length > 0) {
				api.setInputValue(selectedValue[0]);
			} else {
				// Clear input if selection is cleared
				api.setInputValue('');
			} */
		}
	});
	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" {name} value={value?.toString() || ''} />
<label {...api.getLabelProps()}>Vendor</label>
<div {...api.getRootProps()}>
	<div
		{...api.getControlProps()}
		class="flex w-full items-center gap-2 rounded-md border border-surface-2 bg-surface-document p-2"
	>
		<input type="number" {...api.getInputProps()} />
		<button {...api.getTriggerProps()}>▼</button>
	</div>
</div>
<div {...api.getPositionerProps()}>
	{#if options.length > 0}
		<ul {...api.getContentProps()}>
			{#each options as item}
				{@const state = api.getItemState({ item })}
				<li {...api.getItemProps({ item })}>
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
	[data-scope='combobox'][data-part='root'] {
		display: inline-flex;
		flex-direction: column;
	}

	[data-scope='combobox'][data-part='content'] {
		background-color: var(--color-surface-document);
		list-style-type: none;
		margin: 0;
		border: 1px solid var(--color-surface-2);
		overscroll-behavior: contain;
		max-height: 240px;
		overflow: auto;
		padding: 2px;
		z-index: 50;
	}

	[data-scope='combobox'][data-part='item'] {
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
	}

	[data-scope='combobox'][data-part='label'] {
		display: block;
		margin-top: 12px;
		margin-bottom: 4px;
	}

	[data-scope='combobox'][data-part='control'] {
		display: inline-flex;
		width: 300px;
	}

	[data-scope='combobox'][data-part='input'] {
		flex: 1;
	}

	[data-scope='combobox'][data-part='clear-trigger'] {
		display: inline-flex;
		font-size: 1.2em;
		/* 		& svg { */
		/* 			width: 1em; */
		/* 			height: 1em; */
		/* } */
	}

	[data-scope='combobox'][data-part='item-group-label'] {
		user-select: none;
		margin-top: 8px;
		display: flex;
		align-items: center;
		padding: 0 8px 8px;
		font-size: 12px;
		font-weight: 600;
	}
</style>
