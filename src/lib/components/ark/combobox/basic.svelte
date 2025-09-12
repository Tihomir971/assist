<script lang="ts">
	import { Portal } from '@ark-ui/svelte/portal';
	import { Combobox, useListCollection } from '@ark-ui/svelte/combobox';
	import { useFilter } from '@ark-ui/svelte/locale';
	import { ChevronDownIcon, XIcon } from '@lucide/svelte';

	const filters = useFilter({ sensitivity: 'base' });

	const { collection, filter } = useListCollection({
		initialItems: ['React', 'Solid', 'Vue', 'Svelte'],
		filter(itemString, filterText) {
			return filters().contains(itemString, filterText);
		}
	});

	const handleInputChange = (details: Combobox.InputValueChangeDetails) => {
		filter(details.inputValue);
	};
</script>

<div class="w-full max-w-sm">
	<Combobox.Root {collection} onInputValueChange={handleInputChange}>
		<Combobox.Label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
			Framework
		</Combobox.Label>
		<Combobox.Control class="relative">
			<Combobox.Input
				class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-20 text-gray-900 placeholder-gray-500 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
				placeholder="Select a framework..."
			/>
			<div class="absolute inset-y-0 right-0 flex items-center">
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
							Frameworks
						</Combobox.ItemGroupLabel>
						{#each collection().items as item (item)}
							<Combobox.Item
								{item}
								class="relative cursor-pointer py-2 pr-9 pl-3 text-gray-900 transition-colors select-none hover:bg-gray-50 data-highlighted:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700 dark:data-highlighted:bg-gray-700"
							>
								<Combobox.ItemText class="block truncate">
									{item}
								</Combobox.ItemText>
								<Combobox.ItemIndicator
									class="absolute inset-y-0 pr-3 text-blue-600 dark:text-blue-400"
								>
									✓
								</Combobox.ItemIndicator>
							</Combobox.Item>
						{/each}
					</Combobox.ItemGroup>
				</Combobox.Content>
			</Combobox.Positioner>
		</Portal>
	</Combobox.Root>
</div>
