<script lang="ts">
	import { fade } from 'svelte/transition';

	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import type { ComboboxProps } from './types.js';
	import { useId } from '../internal/use-id.js';

	let {
		data = $bindable([]),
		value = $bindable([]),
		label = '',
		// Base
		base = '',
		width = '',
		classes = '',
		// Label
		labelBase = 'label',
		labelText = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[fs-error]:text-destructive',
		labelClasses = '',
		// Input
		inputGroupBase = 'input-group grid-cols-[1fr_auto]',
		inputGroupInput = 'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		inputGroupButton = 'input-group-cell',
		inputGroupArrow = '',
		inputGroupClasses = '',
		// Content
		contentBase = 'card p-2',
		contentBackground = 'bg-surface-2',
		contentClasses = '',
		// List
		listBase = 'space-y-1',
		listClasses = '',
		// Option
		optionBase = 'btn justify-start w-full',
		optionHover = '',
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

<span {...api.getRootProps()} class="{base} {width} {classes}">
	<!-- Label -->
	<label {...api.getLabelProps()} class="{labelBase} {labelClasses}">
		{#if label}<span class={labelText}>{label}</span>{/if}
		<!-- Input Group -->
		<div {...api.getControlProps()} class="{inputGroupBase} {inputGroupClasses}">
			<!-- Input -->
			<input {...api.getInputProps()} class={inputGroupInput} />
			<!-- Arrow -->
			<button {...api.getTriggerProps()} class={inputGroupButton}>
				{#if arrow}
					{@render arrow()}
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						style="opacity: 0.5"
						class={inputGroupArrow}
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				{/if}
			</button>
		</div>
	</label>
	<!-- Content -->
	{#if api.open}
		<div
			{...api.getPositionerProps()}
			transition:fade={{ duration: 100 }}
			class="{contentBase} {contentBackground} {contentClasses}"
		>
			{#if options.length > 0}
				<!-- List -->
				<nav {...api.getContentProps()} class="{listBase} {listClasses}">
					{#each options as item}
						{@const isChecked = api.getItemProps({ item })['data-state'] === 'checked'}
						{@const displayClass = isChecked ? optionActive : optionHover}
						<!-- Option -->
						<button
							{...api.getItemProps({ item })}
							class="{optionBase} {displayClass} {optionClasses}"
						>
							{item.label}
						</button>
					{/each}
				</nav>
			{/if}
		</div>
	{/if}
</span>

<!-- <style lang="postcss">
	[data-part='item'][data-highlighted]:not([data-state='checked']) {
		@apply bg-red;
	}
</style> -->
