<script lang="ts">
	import { browser } from '$app/environment';
	import {
		createSvelteTable,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		type GlobalFilterTableState,
		type RowSelectionState,
		type SortingState,
		type Updater,
		type VisibilityState
	} from '$lib/components/walker-tx';

	import { LocalStorage } from '$lib/storage.svelte.js';
	import { getCartContext } from '$lib/components/cart/ctx.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { columnDefs } from './columns.svelte.js';

	import WalkerTable from '$lib/components/walker-tx/WalkerTable.svelte';

	let { data } = $props();

	const cartService = getCartContext();
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

	$effect(() => {
		if (data.searchTerm) {
			table.setGlobalFilter(data.searchTerm);
		}
	});
	async function addToCart(): Promise<void> {
		if (browser && cartService) {
			// Get selected rows first
			const selectedRows = table.getRowModel().rows.filter((row) => row.getIsSelected());

			// Process each selected row
			for (const row of selectedRows) {
				const cartItems = await cartService.getCartItems();
				const existingItemIndex = cartItems.findIndex((item) => item.id === row.original.id);

				if (existingItemIndex !== -1) {
					await cartService.updateItemQuantity(
						row.original.id,
						cartItems[existingItemIndex].quantity + 1
					);
				} else {
					await cartService.addItem({
						id: row.original.id,
						name: row.original.name,
						quantity: 1,
						sku: row.original.sku
					});
				}
			}

			rowSelectionState = {};
		}
	}
</script>

<Card.Root class="flex flex-1 flex-col gap-0 overflow-hidden bg-transparent py-0">
	<Card.Header class="bg-surface-1 p-3">
		<DataTableToolbar
			{table}
			bind:rowSelectionState
			bind:globalFilterTableState
			warehouses={data.warehouses}
			{addToCart}
		/>
	</Card.Header>
	<Separator />
	<Card.Content class="flex-1 overflow-auto px-2">
		{#await data.products}
			<p>Loading...</p>
		{:then}
			<WalkerTable {table} />
		{/await}
	</Card.Content>
</Card.Root>
