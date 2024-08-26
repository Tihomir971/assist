<script lang="ts">
	import type { TableViewModel } from 'svelte-headless-table';
	import type { ProductSchema } from '$lib/types/zod.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { Checkbox } from '$lib/components/ui/checkbox';

	export let tableModel: TableViewModel<ProductSchema>;
	const { pluginStates, flatColumns } = tableModel;
	const { hiddenColumnIds } = pluginStates.hide;

	function handleHide(id: string) {
		hiddenColumnIds.update((ids: string[]) => {
			if (ids.includes(id)) {
				return ids.filter((i) => i !== id);
			}
			return [...ids, id];
		});
	}

	/* 	const hidableCols = [
		'MPN',
		'Tax',
		'level_min',
		'level_max',
		'unitsperpack',
		'priceMarket',
		'pricePurchase'
	]; */
	const hidableCols: string[] = [];
	flatColumns.forEach((col) => {
		//	console.log('col.plugins?.export', col.plugins?.export);

		if (col.plugins?.export.exclude !== true) {
			hidableCols.push(col.id);
		}
	});
	flatColumns[0].plugins;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="outline" class="ml-auto hidden lg:flex" builders={[builder]}>
			Columns <ChevronDown class="ml-2 h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<div class="space-y-2 p-1">
			{#each flatColumns as col}
				{#if hidableCols.includes(col.id)}
					<div class="flex flex-row items-center space-x-3">
						<input
							type="checkbox"
							checked={!$hiddenColumnIds.includes(col.id)}
							on:change={() => handleHide(col.id)}
						/>
						<!-- <Checkbox
							checked={!$hiddenColumnIds.includes(col.id)}
							onCheckedChange={() => handleHide(col.id)}
							class="flex h-4 w-4 items-center justify-center text-current"
						/> -->
						<span>
							{col.header}
						</span>
					</div>
					<!-- <DropdownMenu.CheckboxItem
					checked={!$hiddenColumnIds.includes(col.id)}
					on:click={() => handleHide(col.id)}
				>
					{col.header}
				</DropdownMenu.CheckboxItem> -->
				{/if}
			{/each}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
