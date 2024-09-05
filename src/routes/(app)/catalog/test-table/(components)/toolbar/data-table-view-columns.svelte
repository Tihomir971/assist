<script lang="ts">
	import type { TableViewModel } from 'svelte-headless-table';
	import type { ProductSchema } from '$lib/types/zod.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { browser } from '$app/environment';
	import type { FlattenedProduct } from '../../+page.server.js';
	export let tableModel: TableViewModel<FlattenedProduct>;
	const { pluginStates, flatColumns } = tableModel;
	const { hiddenColumnIds } = pluginStates.hide;

	function handleHide(id: string) {
		hiddenColumnIds.update((ids: string[]) => {
			let newIds;
			if (ids.includes(id)) {
				newIds = ids.filter((i) => i !== id);
			} else {
				newIds = [...ids, id];
			}
			if (browser) {
				localStorage.setItem('hiddenColumns', JSON.stringify(newIds));
			}
			return newIds;
		});
	}

	const hidableCols: string[] = [];
	flatColumns.forEach((col) => {
		if (col.plugins?.export.exclude !== true) {
			hidableCols.push(col.id);
		}
	});
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
						<span>
							{col.header}
						</span>
					</div>
				{/if}
			{/each}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
