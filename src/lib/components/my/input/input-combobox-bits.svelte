<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Combobox } from 'bits-ui';
	import { cn } from '$lib/utils';
	import PhList from '~icons/ph/list';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhCheck from '~icons/ph/check';
	import PhCaretDoubleUp from '~icons/ph/caret-double-up';
	import PhCaretDoubleDown from '~icons/ph/caret-double-down';
	import BaseInput from './input-base.svelte';

	type Item = {
		value: string | number;
		label: string;
		[key: string]: any; // Allow additional properties
	};

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		items: Item[]; // Array of items to select from
		value?: string | number | null; // ID of the selected item
		placeholder?: string;
		disabled?: boolean;
		error?: string;
		labelText?: string;
		inline?: boolean;
		class?: string;
		contentClass?: string; // Optional class for dropdown content
		itemClass?: string; // Optional class for dropdown items
	};

	let {
		ref = $bindable(null),
		items = [],
		value = $bindable(), // This will be the ID
		placeholder = 'Select an option',
		disabled = false,
		error,
		labelText,
		inline = false,
		class: className = '',
		contentClass = '',
		itemClass = '',
		...restProps
	}: Props = $props();

	// Internal state
	let searchValue = $state('');
	let open = $state(false);

	// Map our id/label items to value/label format expected by bits-ui
	const bitsItems = $derived(
		items.map((item) => ({
			value: String(item.value), // Bits-UI expects string values
			label: item.label
		}))
	);

	// Track if we're currently filtering
	let isFiltering = $state(false);

	// Filtering logic - filter items based on search input
	const filteredItems = $derived.by(() => {
		// When not filtering or when dropdown is first opened, show all items
		if (!isFiltering && open) {
			return bitsItems;
		}

		// Otherwise filter based on search input
		return searchValue === ''
			? bitsItems
			: bitsItems.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));
	});

	// Internal value for bits-ui (as string)
	let comboboxValue = $state<string | undefined>(
		value !== null && value !== undefined ? String(value) : undefined
	);

	// Handle when bits-ui updates the value
	$effect(() => {
		if (comboboxValue !== undefined) {
			const originalItem = items.find((item) => String(item.value) === comboboxValue);
			if (originalItem) {
				value = originalItem.value;
			} else {
				value = comboboxValue; // Fallback
			}
		} else {
			value = null;
		}
	});

	// Sync external value changes to internal comboboxValue
	$effect(() => {
		const externalValueStr = value !== null && value !== undefined ? String(value) : undefined;
		if (externalValueStr !== comboboxValue) {
			comboboxValue = externalValueStr;
			if (!open) {
				const selectedItem = items.find((item) => String(item.value) === externalValueStr);
				// Update searchValue only if an item is actually selected externally
				searchValue = selectedItem ? selectedItem.label : '';
			}
		}
	});

	// Handle open state changes
	function handleOpenChange(isOpen: boolean) {
		if (isOpen) {
			// When opening, temporarily disable filtering to show all items
			isFiltering = false;
		} else {
			// When closing, reset the search value
			searchValue = '';

			// Then set the display value to the selected item's label
			const selectedItem = items.find((item) => String(item.value) === comboboxValue);
			if (selectedItem) {
				searchValue = selectedItem.label;
			}
		}
	}

	// Reference to the BaseInput's root element for anchoring
	let baseInputRootElement: HTMLDivElement | null = $state(null);

	// We're handling input changes directly in the oninput event handler
</script>

{#snippet Icon()}
	<PhList />
{/snippet}

{#snippet Content()}
	<Combobox.Input
		bind:ref
		{placeholder}
		{disabled}
		defaultValue={comboboxValue}
		class="w-full border-none bg-transparent outline-none"
		oninput={(e) => {
			searchValue = e.currentTarget.value;
			isFiltering = true; // Enable filtering when user types
			if (!open) open = true;
		}}
	/>
{/snippet}

{#snippet Action()}
	<Combobox.Trigger
		class="flex h-full items-center justify-center rounded-sm"
		aria-label="Toggle options"
	>
		<PhCaretDown class={cn('transition-transform', open && 'rotate-180')} />
	</Combobox.Trigger>
{/snippet}

<Combobox.Root type="single" bind:value={comboboxValue} bind:open onOpenChange={handleOpenChange}>
	<BaseInput
		bind:rootElement={baseInputRootElement}
		class={className}
		{error}
		{labelText}
		{inline}
		{Icon}
		{Content}
		{Action}
	/>

	<Combobox.Portal>
		<Combobox.Content
			customAnchor={baseInputRootElement}
			sideOffset={10}
			class={cn(
				'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
				'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
				'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				'z-50 h-fit max-h-[min(var(--bits-combobox-content-available-height),18rem)]',
				'w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)]',
				'rounded-sm border border-muted bg-popover px-1 py-3 shadow-popover outline-hidden select-none',
				'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1',
				'data-[side=top]:-translate-y-1',
				contentClass
			)}
		>
			<Combobox.ScrollUpButton class="flex w-full items-center justify-center py-1">
				<PhCaretDoubleUp class="size-3" />
			</Combobox.ScrollUpButton>
			<Combobox.Viewport class="p-1">
				{#each filteredItems as item (item.value)}
					<Combobox.Item
						value={item.value}
						label={item.label}
						class={cn(
							'flex h-10 w-full items-center rounded-sm py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none data-highlighted:bg-muted',
							itemClass
						)}
					>
						{#snippet children({ selected })}
							{item.label}
							{#if selected}
								<div class="ml-auto">
									<PhCheck />
								</div>
							{/if}
						{/snippet}
					</Combobox.Item>
				{:else}
					<div class="px-2 py-1.5 text-center text-sm text-muted-foreground">No results found.</div>
				{/each}
			</Combobox.Viewport>
			<Combobox.ScrollDownButton class="flex w-full items-center justify-center py-1">
				<PhCaretDoubleDown class="size-3" />
			</Combobox.ScrollDownButton>
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
