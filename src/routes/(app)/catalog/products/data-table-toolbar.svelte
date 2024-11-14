<script lang="ts">
	import type { RowSelectionState, GlobalFilterTableState, Table } from '$lib/components/walker-tx';
	import type { FlattenedProduct, Warehouse } from './columns.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	//Components
	import DataTableHeaderSync from './data-table-header-sync.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	//Icons
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { browser } from '$app/environment';

	type Props = {
		rowSelectionState: RowSelectionState;
		globalFilterTableState: GlobalFilterTableState | undefined;
		table: Table<FlattenedProduct>;
		showStock: boolean;
		showVat: boolean;
		addToCart: () => void;
		warehouses: Warehouse[];
	};
	let {
		table,
		rowSelectionState = $bindable(),
		globalFilterTableState = $bindable(),
		showStock,
		showVat,
		addToCart,
		warehouses
	}: Props = $props();
	let strRowSelectionState = $derived(Object.keys(rowSelectionState).map((x) => x));
	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			table.setGlobalFilter(target.value);
		}
	}
	let warehouseValue = $state('');

	const triggerWarehouseLabel = $derived(
		warehouses.find((f) => f.value === warehouseValue)?.label ?? 'Select warehouse'
	);
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
			checked={showStock}
			onCheckedChange={(checked) => {
				console.log('checkedStock', checked);
				const newUrl = new URL($page.url);
				newUrl?.searchParams?.set('stock', checked ? 'true' : 'false');
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
				newUrl?.searchParams?.set('showVat', checked ? 'true' : 'false');
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
	<Button variant="outline" onclick={addToCart}>Add to Cart</Button>
	<Select.Root
		type="single"
		name="favoriteFruit"
		bind:value={warehouseValue}
		onValueChange={(v) => {
			const newUrl = new URL($page.url);
			newUrl?.searchParams?.set('wh', v);
			goto(newUrl);
		}}
	>
		<Select.Trigger class={buttonVariants({ variant: 'outline', class: 'w-fit' })}>
			{triggerWarehouseLabel}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each warehouses as warehouse}
					<Select.Item value={warehouse.value} label={warehouse.label} />
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
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
					onCheckedChange={(value) => {
						column.toggleVisibility(!!value);
					}}
				>
					{column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
