<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';

	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';
	import type { CategoryLookup } from '$lib/services/supabase/category.service';

	interface Props {
		selectedCategoryIds: number[] | undefined;
		categoriesLookup: CategoryLookup[];
		onCategoriesChange: (categoryIds: number[]) => void;
	}

	let {
		selectedCategoryIds = $bindable([]),
		categoriesLookup,
		onCategoriesChange
	}: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedCount = $derived((selectedCategoryIds || []).length);

	function toggleCategory(categoryId: number) {
		const currentArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [];
		const index = currentArray.indexOf(categoryId);

		if (index > -1) {
			selectedCategoryIds = currentArray.filter((id) => id !== categoryId);
		} else {
			selectedCategoryIds = [...currentArray, categoryId];
		}
	}

	// Intermediate state variable for the template
	let categoriesToDisplay: CategoryLookup[] = $state([]);

	$effect(() => {
		const currentSelectedIds = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [];
		categoriesToDisplay = currentSelectedIds
			.map((id) => categoriesLookup.find((cat) => cat.value === id))
			.filter((cat): cat is CategoryLookup => cat !== undefined && cat !== null);
	});

	let lastNotifiedCategoryIds: string | undefined = undefined;
	$effect(() => {
		const idsToProcess = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [];
		const currentCategoryIdsJson = JSON.stringify(idsToProcess.slice().sort());
		if (currentCategoryIdsJson !== lastNotifiedCategoryIds) {
			onCategoriesChange(idsToProcess);
			lastNotifiedCategoryIds = currentCategoryIdsJson;
		}
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef} class="w-full">
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-full justify-between"
				onclick={() => (open = !open)}
			>
				{selectedCount > 0
					? `${selectedCount} kategorij${selectedCount === 1 ? 'a' : selectedCount > 1 && selectedCount < 5 ? 'e' : 'a'} izabrano`
					: 'Izaberite kategorije...'}
				<ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[--trigger-width] p-0">
		<Command.Root>
			<Command.Input placeholder="Pretražite kategorije..." class="h-9" />
			<Command.List>
				<Command.Empty>Nema pronađenih kategorija.</Command.Empty>
				<Command.Group>
					{#each categoriesLookup as category (category.value)}
						<Command.Item
							value={category.label}
							onSelect={() => {
								toggleCategory(category.value);
							}}
							class="cursor-pointer"
						>
							<CheckIcon
								class={cn(
									'mr-2 h-4 w-4',
									(selectedCategoryIds || []).includes(category.value) ? 'opacity-100' : 'opacity-0'
								)}
							/>
							{category.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#if categoriesToDisplay.length > 0}
	<div class="mt-2 flex flex-wrap gap-1">
		{#each categoriesToDisplay as category (category.value)}
			<Badge variant="secondary" class="flex items-center gap-1">
				{category.label}
				<button
					type="button"
					onclick={() => toggleCategory(category.value)}
					class="rounded-full hover:bg-muted-foreground/20 focus:outline-none"
					aria-label={`Ukloni kategoriju ${category.label}`}
				>
					<XIcon class="h-3 w-3" />
				</button>
			</Badge>
		{/each}
	</div>
{/if}

<p class="mt-2 text-xs text-muted-foreground">
	Pravilo će se primeniti samo ako proizvod pripada nekoj od izabranih kategorija. Ako nijedna
	kategorija nije izabrana, ovaj uslov se ignoriše.
</p>
