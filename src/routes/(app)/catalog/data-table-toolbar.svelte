<script lang="ts">
	import type { RowSelectionState, GlobalFilterTableState, Table } from '$lib/components/walker-tx';
	import type { FlattenedProduct, Warehouse } from './columns.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	//Components
	import DataTableHeaderSync from './data-table-header-sync.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	//Icons
	import PhCaretDown from '~icons/ph/caret-down';
	import { CheckboxZag, SelectZag } from '$lib/components/zag/index.js';

	type Props = {
		rowSelectionState: RowSelectionState;
		globalFilterTableState: GlobalFilterTableState | undefined;
		table: Table<FlattenedProduct>;
		addToCart: () => void;
		warehouses: Warehouse[];
	};
	let {
		table,
		rowSelectionState = $bindable(),
		globalFilterTableState = $bindable(),
		addToCart,
		warehouses
	}: Props = $props();
	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			table.setGlobalFilter(target.value);
		}
	}

	let checkedVat = $derived(page.url.searchParams.get('vat') === 'true');
	let checkedSubcategories = $derived(page.url.searchParams.get('sub') === 'true');
	let inputValueWarehouse = $derived(page.url.searchParams.get('wh') ?? '');
	let inputGlobaSearch = $derived(page.url.searchParams.get('search'));
	$effect(() => {
		if (inputGlobaSearch) {
			table.setGlobalFilter(inputGlobaSearch);
		}
	});
	const triggerWarehouseLabel = $derived(
		warehouses.find((f) => f.value === inputValueWarehouse)?.label ?? 'Select warehouse'
	);

	const reports = [
		{ value: 'all', label: 'All Products' },
		{ value: 'relocation', label: 'Relocation' },
		{ value: 'replenish', label: 'Replenish' }
	];
	let inputValueReport = $state(page.url.searchParams.get('report') ?? '');
	const triggerReportContent = $derived(
		reports.find((f) => f.value === inputValueReport)?.label ?? 'Select a report'
	);

	function handleSalesGraphClick() {
		const selectedSkus = Object.keys(rowSelectionState).join(',');
		if (selectedSkus) {
			window.open(`/report/salesgraph?skus=${selectedSkus}`, '_blank');

			// goto(`/report/salesgraph?skus=${selectedSkus}`);
		}
	}
</script>

<div class="flex items-center justify-between gap-4">
	<Input
		type="search"
		value={globalFilterTableState ?? ''}
		oninput={handleSearch}
		placeholder="Filter products..."
	/>
	<div class="flex w-full items-center space-x-2">
		<CheckboxZag
			id="show-subcategories"
			checked={checkedSubcategories}
			label="Subcategories"
			onCheckedChange={(details) => {
				console.log(details);
				const newUrl = new URL(page.url);
				details.checked
					? newUrl?.searchParams?.set('sub', 'true')
					: newUrl?.searchParams?.delete('sub');
				goto(newUrl);
			}}
		/>
	</div>

	<div class="flex w-full items-center space-x-2">
		<CheckboxZag
			id="show-vat"
			checked={checkedVat}
			label="Show VAT"
			onCheckedChange={(details) => {
				const newUrl = new URL(page.url);
				details.checked
					? newUrl?.searchParams?.set('vat', 'true')
					: newUrl?.searchParams?.delete('vat');
				goto(newUrl);
			}}
		/>
	</div>
	<Button variant="outline" onclick={addToCart}>Add to Cart</Button>
	<Button variant="outline" onclick={handleSalesGraphClick}>Sales Graph</Button>
	<SelectZag
		items={reports}
		bind:value={inputValueReport}
		placeholder="Select report"
		onValueChange={(details) => {
			console.log(details);
			const url = new URL(page.url);
			if (details.value.length === 0) {
				url?.searchParams?.delete('report');
				url?.searchParams?.delete('sub');
			} else {
				url?.searchParams?.set('report', details.value[0]);
			}
			goto(url);
		}}
	/>
	<SelectZag
		value={inputValueWarehouse}
		items={warehouses}
		onValueChange={(details) => {
			if (details.value.length === 0) {
				return;
			}
			const newUrl = new URL(page.url);
			newUrl?.searchParams?.set('wh', details.value[0]);
			goto(newUrl);
		}}
	/>

	<DataTableHeaderSync bind:rowSelectionState />
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Columns<PhCaretDown class="ml-2" /></Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
				<DropdownMenu.CheckboxItem
					class="capitalize"
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
