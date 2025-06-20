<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';

	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';
	import type { BrandLookup } from '$lib/services/supabase/brand.service';

	interface Props {
		selectedBrandIds: number[] | undefined;
		brandsLookup: BrandLookup[];
		onBrandsChange: (brandIds: number[]) => void;
	}

	let { selectedBrandIds = $bindable([]), brandsLookup, onBrandsChange }: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedCount = $derived((selectedBrandIds || []).length);

	function toggleBrand(brandId: number) {
		const currentArray = Array.isArray(selectedBrandIds) ? selectedBrandIds : [];
		const index = currentArray.indexOf(brandId);

		if (index > -1) {
			selectedBrandIds = currentArray.filter((id) => id !== brandId);
		} else {
			selectedBrandIds = [...currentArray, brandId];
		}
	}

	// Intermediate state variable for the template
	let brandsToDisplay: BrandLookup[] = $state([]);

	$effect(() => {
		const currentSelectedIds = Array.isArray(selectedBrandIds) ? selectedBrandIds : [];
		brandsToDisplay = currentSelectedIds
			.map((id) => brandsLookup.find((brand) => brand.value === id))
			.filter((brand): brand is BrandLookup => brand !== undefined && brand !== null);
	});

	let lastNotifiedBrandIds: string | undefined = undefined;
	$effect(() => {
		const idsToProcess = Array.isArray(selectedBrandIds) ? selectedBrandIds : [];
		const currentBrandIdsJson = JSON.stringify(idsToProcess.slice().sort());
		if (currentBrandIdsJson !== lastNotifiedBrandIds) {
			onBrandsChange(idsToProcess);
			lastNotifiedBrandIds = currentBrandIdsJson;
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
					? `${selectedCount} brend${selectedCount === 1 ? '' : selectedCount > 1 && selectedCount < 5 ? 'a' : 'ova'} izabrano`
					: 'Izaberite brendove...'}
				<ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[--trigger-width] p-0">
		<Command.Root>
			<Command.Input placeholder="Pretražite brendove..." class="h-9" />
			<Command.List>
				<Command.Empty>Nema pronađenih brendova.</Command.Empty>
				<Command.Group>
					{#each brandsLookup as brand (brand.value)}
						<Command.Item
							value={brand.label}
							onSelect={() => {
								toggleBrand(brand.value);
							}}
							class="cursor-pointer"
						>
							<CheckIcon
								class={cn(
									'mr-2 h-4 w-4',
									(selectedBrandIds || []).includes(brand.value) ? 'opacity-100' : 'opacity-0'
								)}
							/>
							{brand.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#if brandsToDisplay.length > 0}
	<div class="mt-2 flex flex-wrap gap-1">
		{#each brandsToDisplay as brand (brand.value)}
			<Badge variant="secondary" class="flex items-center gap-1">
				{brand.label}
				<button
					type="button"
					onclick={() => toggleBrand(brand.value)}
					class="rounded-full hover:bg-muted-foreground/20 focus:outline-none"
					aria-label={`Ukloni brend ${brand.label}`}
				>
					<XIcon class="h-3 w-3" />
				</button>
			</Badge>
		{/each}
	</div>
{/if}

<p class="mt-2 text-xs text-muted-foreground">
	Pravilo će se primeniti samo ako proizvod pripada nekom od izabranih brendova. Ako nijedan brend
	nije izabran, ovaj uslov se ignoriše.
</p>
