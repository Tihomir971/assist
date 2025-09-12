<script lang="ts">
	import { Portal } from '@ark-ui/svelte/portal';
	import { Combobox, useCombobox, useListCollection } from '@ark-ui/svelte/combobox';
	import { ChevronDownIcon, XIcon, LoaderIcon } from '@lucide/svelte';
	import { searchUsers } from './async.remote';

	// User type definition
	interface User {
		id: number;
		name: string;
		email: string;
		avatar: string;
	}

	let isLoading = $state(false);
	let inputValue = $state('');

	const instanceId = $props.id();
	const { collection, set } = useListCollection<User>({
		initialItems: [],
		itemToString: (item) => item.name,
		itemToValue: (item) => item.id.toString()
	});

	const combobox = useCombobox({
		collection,
		id: instanceId,
		placeholder: 'Type to search users...',
		get inputValue() {
			return inputValue;
		},
		onInputValueChange: (details) => {
			inputValue = details.inputValue;
		}
	});

	// Debounced search: wait for the user to stop typing before calling searchUsers.
	// This prevents calling the search on every keystroke.
	let _searchTimeout: ReturnType<typeof setTimeout> | null = null;
	const DEBOUNCE_MS = 300;

	$effect(() => {
		// Clear any pending timeout whenever inputValue changes
		if (_searchTimeout) {
			clearTimeout(_searchTimeout);
			_searchTimeout = null;
		}

		// Immediately handle empty / too-short input without waiting
		if (inputValue.length === 0) {
			set([]);
			isLoading = false;
			return;
		}

		if (inputValue.length < 2) {
			set([]);
			isLoading = false;
			return;
		}

		// Start (or restart) debounce timer
		_searchTimeout = setTimeout(async () => {
			isLoading = true;
			try {
				const results = await searchUsers(inputValue);
				set(results);
			} catch (error) {
				console.error('Failed to search users:', error);
				set([]);
			} finally {
				isLoading = false;
			}
			_searchTimeout = null;
		}, DEBOUNCE_MS);

		// Cleanup function for Svelte 5 runes: called when the effect re-runs or component unmounts.
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
		Search Users
	</Combobox.Label>
	<Combobox.Control class="relative">
		<Combobox.Input
			class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-20 text-gray-900 placeholder-gray-500 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
		/>
		<div class="absolute inset-y-0 right-0 flex items-center">
			{#if isLoading}
				<LoaderIcon class="mx-2 h-4 w-4 animate-spin text-blue-500 dark:text-blue-400" />
			{/if}
			<Combobox.ClearTrigger
				class="px-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
			>
				<XIcon class="h-4 w-4" />
			</Combobox.ClearTrigger>
			<Combobox.Trigger
				class="px-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
			>
				<ChevronDownIcon class="h-4 w-4" />
			</Combobox.Trigger>
		</div>
	</Combobox.Control>
	<Portal>
		<Combobox.Positioner>
			<Combobox.Content
				class="ring-opacity-5 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-hidden dark:bg-gray-800 dark:ring-gray-600"
			>
				<Combobox.ItemGroup>
					<Combobox.ItemGroupLabel
						class="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
					>
						Users
					</Combobox.ItemGroupLabel>

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
								{inputValue.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
							</p>
						</div>
					{:else}
						{#each collection().items as user (user.id)}
							<Combobox.Item
								item={user}
								class="relative cursor-pointer py-2 pr-9 pl-3 text-gray-900 transition-colors select-none hover:bg-gray-50 data-highlighted:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700 dark:data-highlighted:bg-gray-700"
							>
								<div class="flex items-center">
									<div
										class="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white dark:bg-blue-600"
									>
										{user.avatar}
									</div>
									<div class="min-w-0 flex-1">
										<Combobox.ItemText
											class="block truncate text-sm font-medium text-gray-900 dark:text-gray-100"
										>
											{user.name}
										</Combobox.ItemText>
										<p class="truncate text-sm text-gray-500 dark:text-gray-400">
											{user.email}
										</p>
									</div>
								</div>
								<Combobox.ItemIndicator
									class="absolute inset-y-0 pr-3 text-blue-600 dark:text-blue-400"
								>
									✓
								</Combobox.ItemIndicator>
							</Combobox.Item>
						{/each}
					{/if}
				</Combobox.ItemGroup>
			</Combobox.Content>
		</Combobox.Positioner>
	</Portal>
</Combobox.RootProvider>
