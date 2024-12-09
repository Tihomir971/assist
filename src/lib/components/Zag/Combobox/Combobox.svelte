<script lang="ts">
	import './combobox.css';
	import { fade } from 'svelte/transition';
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import type { ComboboxProps } from './types.js';
	import { useId } from '$lib/internal/use-id.js';

	let {
		data = $bindable([]),
		value = $bindable([]),
		label = '',
		// Base
		base = '',
		width = '',
		classes = '',
		// Label
		/* labelBase = 'label', */
		labelBase = '',
		/* labelText = 'label-text', */
		labelText = '',
		labelClasses = '',
		// Input
		/* inputGroupBase = 'input-group grid-cols-[1fr_auto]', */
		inputGroupBase = '',
		inputGroupInput = '',
		/* inputGroupButton = 'input-group-cell', */
		inputGroupButton = '',
		inputGroupArrow = '',
		inputGroupClasses = '',
		// Content
		/* contentBase = 'card p-2', */
		contentBase = '',
		/* contentBackground = 'preset-outlined-surface-200-800 bg-surface-50-950', */
		contentBackground = '',
		contentClasses = '',
		// List
		listBase = 'space-y-1',
		listClasses = '',
		// Option
		/* optionBase = 'btn justify-start w-full', */
		optionBase = '',
		/* optionHover = 'hover:preset-tonal', */
		optionHover = '',
		/* optionActive = 'preset-filled-primary-500', */
		optionActive = '',
		optionClasses = '',
		// Snippets
		arrow,
		// Zag ---
		...zagProps
	}: ComboboxProps = $props();

	// Zag
	let options = $state.raw(data);
	const collection = combobox.collection({
		items: data,
		// Map data structure
		itemToValue: (item) => item.value,
		itemToString: (item) => item.label
	});
	const [snapshot, send] = useMachine(
		combobox.machine({
			id: useId(),
			collection,
			value: $state.snapshot(value),
			loopFocus: true,
			onOpenChange() {
				options = data;
			},
			onInputValueChange({ inputValue }) {
				const filtered = data.filter((item) =>
					item.label.toLowerCase().includes(inputValue.toLowerCase())
				);
				const newOptions = filtered.length > 0 ? filtered : data;
				collection.setItems(newOptions);
				options = newOptions;
			},
			onValueChange(event) {
				value = event.value;
			}
		}),
		{
			context: {
				...zagProps,
				get data() {
					return $state.snapshot(data);
				},
				get value() {
					return $state.snapshot(value);
				}
			}
		}
	);
	const api = $derived(combobox.connect(snapshot, send, normalizeProps));
</script>

<div {...api.getRootProps()}>
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label {...api.getLabelProps()}>Select country</label>
	<div {...api.getControlProps()}>
		<input data-testid="input" {...api.getInputProps()} />
		<button data-testid="trigger" {...api.getTriggerProps()}> ▼ </button>
	</div>
</div>
<div {...api.getPositionerProps()}>
	{#if options.length > 0}
		<ul data-testid="combobox-content" {...api.getContentProps()}>
			{#each options as item}
				<li data-testid={item.label} {...api.getItemProps({ item })}>
					{item.label}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<!-- <style lang="postcss">
	[data-part='item'][data-highlighted]:not([data-state='checked']) {
		@apply bg-surface-500/10;
	}
</style> -->
<style>
	[data-scope='combobox'][data-part='root'] {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	[data-scope='combobox'][data-part='label'] {
		font-size: 1.125rem;
	}
	[data-scope='combobox'][data-part='label'][data-disabled] {
		opacity: 0.6;
	}
	[data-scope='combobox'][data-part='control'] {
		display: inline-flex;
		width: 300px;
		background: var(--color-background);
		border-width: 1px;
		padding-block: 0.25rem;
		padding-inline: 0.75rem;
	}
	[data-scope='combobox'][data-part='control'][data-disabled] {
		opacity: 0.6;
	}
	[data-scope='combobox'][data-part='input'] {
		background: var(--color-background);
		flex: 1 1;
		padding: 0.25rem;
	}
	[data-scope='combobox'][data-part='input']:focus {
		outline: 0;
	}
	[data-scope='combobox'][data-part='content'] {
		list-style-type: none;
		margin: 0;
		max-height: 14rem;
		overflow: auto;
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px 0 rgba(0, 0, 0, 0.06);
		isolation: isolate;
		padding: 0.5rem;
		background: #dafa08;
	}
	[data-scope='combobox'][data-part='item'] {
		padding-inline: 0.5rem;
		padding-block: 0.25rem;
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	[data-scope='combobox'][data-part='item'][data-highlighted] {
		background: #ba1d1d;
		color: #fff;
	}
	[data-scope='combobox'][data-part='item'][data-highlighted]:hover {
		background: #09cd33;
	}
	[data-scope='combobox'][data-part='item'][data-disabled] {
		opacity: 0.5;
		cursor: unset;
	}
</style>
