<script lang="ts">
	import { tick } from 'svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';

	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';
	import type { PartnerLookup } from '$lib/services/supabase/partner.service';

	interface Props {
		selectedPartnerIds: number[] | undefined;
		partnersLookup: PartnerLookup[];
		onPartnersChange: (partnerIds: number[]) => void;
	}

	let { selectedPartnerIds = $bindable([]), partnersLookup, onPartnersChange }: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);
	// Removed searchInput state and filteredPartners derived store

	const selectedCount = $derived((selectedPartnerIds || []).length);

	function togglePartner(partnerId: number) {
		// Ensure selectedPartnerIds is treated as an array, even if initially undefined (though $bindable should handle this)
		const currentArray = Array.isArray(selectedPartnerIds) ? selectedPartnerIds : [];
		const index = currentArray.indexOf(partnerId);

		if (index > -1) {
			// Remove partnerId
			selectedPartnerIds = currentArray.filter((id) => id !== partnerId);
		} else {
			// Add partnerId
			selectedPartnerIds = [...currentArray, partnerId];
		}
	}

	// Intermediate state variable for the template to display selected partners
	let partnersToDisplay: PartnerLookup[] = $state([]);

	$effect(() => {
		const currentSelectedIds = Array.isArray(selectedPartnerIds) ? selectedPartnerIds : [];
		partnersToDisplay = currentSelectedIds
			.map((id) => partnersLookup.find((partner) => partner.value === id))
			.filter((partner): partner is PartnerLookup => partner !== undefined && partner !== null);
	});

	// $effect to notify parent component of changes
	let lastNotifiedPartnerIds: string | undefined = undefined;
	$effect(() => {
		const idsToProcess = Array.isArray(selectedPartnerIds) ? selectedPartnerIds : [];
		// Sort for consistent JSON string comparison
		const currentPartnerIdsJson = JSON.stringify(idsToProcess.slice().sort());
		if (currentPartnerIdsJson !== lastNotifiedPartnerIds) {
			onPartnersChange(idsToProcess);
			lastNotifiedPartnerIds = currentPartnerIdsJson;
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
					? `${selectedCount} partner${selectedCount === 1 ? '' : 'a'} izabrano`
					: 'Izaberite partnere...'}
				<ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[--trigger-width] p-0">
		<Command.Root>
			<Command.Input placeholder="Pretražite partnere..." class="h-9" />
			<Command.List>
				<Command.Empty>Nema pronađenih partnera.</Command.Empty>
				<Command.Group>
					<!-- Iterate over the original partnersLookup -->
					{#each partnersLookup as partner (partner.value)}
						<Command.Item
							value={partner.label}
							onSelect={() => {
								togglePartner(partner.value); // Use partner.value (ID) for selection logic
							}}
							class="cursor-pointer"
						>
							<CheckIcon
								class={cn(
									'mr-2 h-4 w-4',
									(selectedPartnerIds || []).includes(partner.value) ? 'opacity-100' : 'opacity-0'
								)}
							/>
							{partner.label}
							<!-- Display the label -->
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#if partnersToDisplay.length > 0}
	<div class="mt-2 flex flex-wrap gap-1">
		{#each partnersToDisplay as partner (partner.value)}
			<Badge variant="secondary" class="flex items-center gap-1">
				{partner.label}
				<button
					type="button"
					onclick={() => togglePartner(partner.value)}
					class="rounded-full hover:bg-muted-foreground/20 focus:outline-none"
					aria-label={`Ukloni partnera ${partner.label}`}
				>
					<XIcon class="h-3 w-3" />
				</button>
			</Badge>
		{/each}
	</div>
{/if}

<p class="mt-2 text-xs text-muted-foreground">
	Pravilo će se primeniti samo za izabrane partnere. Ako nijedan partner nije izabran, ovaj uslov se
	ignoriše.
</p>
