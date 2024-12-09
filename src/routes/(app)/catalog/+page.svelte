<script lang="ts">
	import {
		createSvelteTable,
		FlexRender,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		type GlobalFilterTableState,
		type RowSelectionState,
		type SortingState,
		type Updater,
		type VisibilityState
	} from '$lib/components/walker-tx';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	import { columnDefs } from './columns.svelte.js';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import ArrowDownUp from 'lucide-svelte/icons/arrow-down-up';

	import DataTableToolbar from './data-table-toolbar.svelte';
	import { browser } from '$app/environment';
	import { LocalStorage } from '$lib/storage.svelte.js';
	import WalkerTable from '$lib/components/walker-tx/WalkerTable.svelte';
	import { getCartContext } from '$lib/components/cart/ctx.svelte.js';

	let { data } = $props();
	//let { products } = data;
	//let dataState = $state(data.products);

	const cartStorageCtx = getCartContext();
	// Define a reactive state to track the row selection state.
	let rowSelectionState: RowSelectionState = $state({});
	let sorting = $state<SortingState>([]);
	const storageColumnVisibility = new LocalStorage<VisibilityState>('hiddenColumns', {});
	let columnVisibility = $state<VisibilityState>(storageColumnVisibility.current);
	let globalFilterTableState = $state<GlobalFilterTableState>();

	function onRowSelectionChange(updater: Updater<RowSelectionState>) {
		// Update the selection state by reassigning the $state
		if (updater instanceof Function) {
			rowSelectionState = updater(rowSelectionState);
		} else {
			rowSelectionState = updater;
		}
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			table.setGlobalFilter(target.value);
		}
	}

	// Create the table and bind the row selection state using a getter.
	const table = createSvelteTable({
		get data() {
			return data.products;
		},
		columns: columnDefs,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		globalFilterFn: 'includesString',
		onGlobalFilterChange: (updater) => {
			if (typeof updater === 'function') {
				globalFilterTableState = updater(globalFilterTableState);
			} else {
				globalFilterTableState = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onRowSelectionChange: onRowSelectionChange,
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
			storageColumnVisibility.current = columnVisibility;
		},
		state: {
			get rowSelection() {
				return rowSelectionState;
			},
			get globalFilter() {
				return globalFilterTableState;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			}
		},
		getRowId: (originalRow) => originalRow.id.toString()
	});
	function addToCart(): void {
		if (browser) {
			table.getRowModel().rows.forEach((row) => {
				if (row.getIsSelected()) {
					const existingItemIndex = cartStorageCtx.current.findIndex(
						(item) => item.id === row.original.id
					);

					if (existingItemIndex !== -1) {
						cartStorageCtx.current[existingItemIndex].quantity += 1;
					} else {
						cartStorageCtx.current.push({
							id: row.original.id,
							name: row.original.name,
							quantity: 1,
							sku: row.original.sku
						});
					}
				}
			});

			//cartItems.current = currentItems;
			rowSelectionState = {};
		}
	}
</script>

<Card.Root class="flex flex-1 flex-col overflow-hidden">
	<Card.Header class="flex-row items-center justify-between">
		<div>
			<Card.Title>Card Title</Card.Title>
			<Card.Description>Card Description</Card.Description>
		</div>

		<DataTableToolbar
			{table}
			bind:rowSelectionState
			bind:globalFilterTableState
			showStock={data.showStock}
			showVat={data.showVat}
			showSub={data.showSub}
			warehouses={data.warehouses}
			{addToCart}
			activeWarehouse={data.activeWarehouse}
		/>
	</Card.Header>
	<Card.Content class="flex-1 overflow-auto p-4">
		<WalkerTable {table} />
	</Card.Content>
</Card.Root>
