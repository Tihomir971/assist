<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Portal } from '@ark-ui/svelte/portal';
	import { Combobox, useCombobox, useListCollection } from '@ark-ui/svelte/combobox';
	import { ChevronDownIcon, XIcon, LoaderIcon } from '@lucide/svelte';

	type T = $$Generic;

	export interface Props<T> {
		// Required mapping for Ark collection (make non-optional locally)
		itemToString: (item: T) => string;
		itemToValue: (item: T) => string | number;

		// UI props
		label?: string;
		placeholder?: string;
		minChars?: number;
		debounceMs?: number;

		// Required behavior
		search: (query: string) => Promise<T[]>;

		itemContent?: Snippet<[{ item: T }]>;
	}

	// Svelte 5 runes typed props
	let {
		label = 'Search',
		placeholder = 'Type to search...',
		minChars = 2,
		debounceMs = 300,
		search,
		itemToString,
		itemToValue,
		itemContent
	}: Props<T> = $props();

	let isLoading = $state(false);
	let inputValue = $state('');

	// Coerce value to string for Ark's collection keying
	const itemValueToString = (item: T) => String(itemToValue(item));

	// List collection for items
	const { collection, set } = useListCollection({
		initialItems: [],
		itemToString,
		itemToValue: itemValueToString
	});

	// Combobox controller - use onInputValueChange callback approach
	const id = $props.id();
	const combobox = useCombobox({
		id,
		collection,
		placeholder,
		onInputValueChange: (details) => {
			inputValue = details.inputValue;
			handleInputChange(details.inputValue);
		}
	});

	// Debounced async search - use simpler approach without $effect
	let _searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function handleInputChange(value: string) {
		// Clear existing timeout
		if (_searchTimeout) {
			clearTimeout(_searchTimeout);
			_searchTimeout = null;
		}

		// Handle empty / too short
		if (!value || value.length < minChars) {
			set([]);
			isLoading = false;
			return;
		}

		// Set loading state immediately
		isLoading = true;

		// Debounced search - reduced timeout to prevent violations
		_searchTimeout = setTimeout(async () => {
			try {
				const results = await search(value);
				// Only update if this is still the current search
				if (inputValue === value) {
					set(results || []);
				}
			} catch (err) {
				console.error('ComboboxAsync search failed:', err);
				if (inputValue === value) {
					set([]);
				}
			} finally {
				if (inputValue === value) {
					isLoading = false;
				}
			}
			_searchTimeout = null;
		}, debounceMs);
	}

	// Cleanup on component destroy
	$effect(() => {
		return () => {
			if (_searchTimeout) {
				clearTimeout(_searchTimeout);
				_searchTimeout = null;
			}
		};
	});
</script>

<Combobox.RootProvider value={combobox} class="w-full max-w-sm">
	<Combobox.Label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</Combobox.Label>

	<Combobox.Control class="relative">
		<Combobox.Input
			class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-20 text-gray-900 placeholder-gray-500 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
			name="combobox-search"
		/>
		<div class="absolute inset-y-0 right-0 flex items-center">
			{#if isLoading}
				<LoaderIcon class="mx-2 h-4 w-4 animate-spin text-blue-500 dark:text-blue-400" />
			{/if}
			<Combobox.ClearTrigger
				class="px-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
				aria-label="Clear"
			>
				<XIcon class="h-4 w-4" />
			</Combobox.ClearTrigger>
			<Combobox.Trigger
				class="px-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
				aria-label="Open"
			>
				<ChevronDownIcon class="h-4 w-4" />
			</Combobox.Trigger>
		</div>
	</Combobox.Control>

	{#if typeof document !== 'undefined'}
		<Portal>
			<Combobox.Positioner>
				<Combobox.Content
					class="ring-opacity-5 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-hidden dark:bg-gray-800 dark:ring-gray-600"
				>
					{#if isLoading}
						<div class="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
							<LoaderIcon
								class="mx-auto mb-2 h-5 w-5 animate-spin text-blue-500 dark:text-blue-400"
							/>
							<p class="text-sm">Searching...</p>
						</div>
					{:else if collection().items.length === 0}
						<div class="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
							<p class="text-sm">
								{inputValue.length < minChars
									? `Type at least ${minChars} characters to search`
									: 'No results'}
							</p>
						</div>
					{:else}
						{#each collection().items as item (itemValueToString(item))}
							<Combobox.Item
								{item}
								class="relative flex cursor-pointer items-center justify-between px-3 py-2 text-gray-900 transition-colors select-none hover:bg-gray-50 data-highlighted:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700 dark:data-highlighted:bg-gray-700"
							>
								{#if itemContent}
									{@render itemContent({ item })}
								{:else}
									<!-- Default rendering -->
									<div class="min-w-0 flex-1">
										<Combobox.ItemText
											class="flex items-center truncate text-sm font-medium text-gray-900 dark:text-gray-100"
										>
											{itemToString(item)}
										</Combobox.ItemText>
									</div>

									<Combobox.ItemIndicator
										class="flex items-center pr-3 text-blue-600 dark:text-blue-400"
									>
										<span class="leading-none">✓</span>
									</Combobox.ItemIndicator>
								{/if}
							</Combobox.Item>
						{/each}
					{/if}
				</Combobox.Content>
			</Combobox.Positioner>
		</Portal>
	{/if}
</Combobox.RootProvider>
