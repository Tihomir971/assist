<script lang="ts">
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import type { ComboboxItem, ComboboxProps } from './types.js';
	import { matchSorter } from 'match-sorter';

	interface Props extends ComboboxProps<ComboboxItem> {
		value?: number | null;
		items?: ComboboxItem[];
		placeholder?: string;
		[key: string]: any; // For formsnap HTML attributes
	}

	let { value = $bindable(), items = [], placeholder, ...htmlProps }: Props = $props();

	let options = $state.raw(items);
	let isLoading = $state(false);

	// Memoize collection to avoid recreation on every render
	const collection = $derived(
		combobox.collection({
			items: options,
			itemToValue: (item) => item.value.toString(),
			itemToString: (item) => item.label
		})
	);

	// Debounced filter function for better performance
	let filterTimeout: ReturnType<typeof setTimeout>;
	function debounceFilter(inputValue: string, delay = 150) {
		isLoading = true;
		clearTimeout(filterTimeout);
		filterTimeout = setTimeout(() => {
			const filtered = matchSorter(items, inputValue, {
				keys: ['label']
			});
			options = filtered.length > 0 ? filtered : items;
			isLoading = false;
		}, delay);
	}

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
			isLoading = false;
		},
		onInputValueChange({ inputValue }) {
			if (inputValue.trim() === '') {
				options = items;
				isLoading = false;
			} else {
				debounceFilter(inputValue);
			}
		},
		onValueChange({ value: selectedValue }) {
			value = selectedValue.length > 0 ? parseInt(selectedValue[0]) : null;
		}
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<!-- Hidden input for form submission (gets name, id etc. from formsnap) -->
<input type="hidden" {...htmlProps} value={value ?? ''} />

<div {...api.getRootProps()}>
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
	{:else if !isLoading}
		<div
			class="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-3 text-popover-foreground shadow-md"
		>
			<div class="text-sm text-muted-foreground">No options found</div>
		</div>
	{/if}
</div>
