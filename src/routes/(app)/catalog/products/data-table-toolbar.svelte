<script lang="ts">
	import type { RowSelectionState, GlobalFilterTableState, Table } from '$lib/components/walker-tx';
	import type { FlattenedProduct } from './columns';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	//Components
	import DataTableHeaderSync from './data-table-header-sync.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	//Icons
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

	type Props = {
		rowSelectionState: RowSelectionState;
		globalFilterTableState: GlobalFilterTableState | undefined;
		table: Table<FlattenedProduct>;
		showStock: boolean;
		showVat: boolean;
	};
	let {
		table,
		rowSelectionState = $bindable(),
		globalFilterTableState = $bindable(),
		showStock,
		showVat
	}: Props = $props();

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			table.setGlobalFilter(target.value);
		}
	}
</script>

<div class="flex items-center gap-4">
	<Input
		type="search"
		value={globalFilterTableState ?? ''}
		oninput={handleSearch}
		placeholder="Filter products..."
	/>
	<div class="flex w-full items-center space-x-2">
		<Checkbox
			id="only-stock"
			onCheckedChange={(checked) => {
				console.log('checkedStock', checked);
				const newUrl = new URL($page.url);
				newUrl?.searchParams?.set('stock', JSON.stringify(checked));
				goto(newUrl);
			}}
		/>
		<Label
			for="only-stock"
			class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			Only on Stock
		</Label>
	</div>
	<div class="flex w-full items-center space-x-2">
		<Checkbox
			id="show-vat"
			checked={showVat}
			onCheckedChange={(checked) => {
				const newUrl = new URL($page.url);
				newUrl?.searchParams?.set('showVat', JSON.stringify(checked));
				goto(newUrl);
			}}
		/>
		<Label
			for="show-vat"
			class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			Show VAT
		</Label>
	</div>
	<DataTableHeaderSync bind:rowSelectionState />
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Columns <ChevronDown class="ml-2 size-4" /></Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
				<DropdownMenu.CheckboxItem
					class="capitalize"
					controlledChecked
					closeOnSelect={false}
					checked={column.getIsVisible()}
					onCheckedChange={(value) => column.toggleVisibility(!!value)}
				>
					{column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
