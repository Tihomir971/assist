<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		type ColumnDef,
		type GlobalFilterTableState,
		type SortingState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { LocalStorage } from '$lib/storage.svelte.js';
	import { getCartContext } from '$lib/components/cart/ctx.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { columnDefs, type FlattenedProduct } from './columns.svelte.js';

	import { useDataTable } from '$lib/components/tanstack/useDataTable.svelte';
	import DataTable from '$lib/components/tanstack/data-table.svelte';

	let { data } = $props();

	const cartService = getCartContext();
	// Define a reactive state to track the row selection state.
	let sortingState: SortingState = $state([]);
	let globalFilterTableState: GlobalFilterTableState | undefined = $state(undefined);

	let storageColumnVisibility = new LocalStorage<VisibilityState>('hiddenColumns', {});
	let visibilityState: VisibilityState = $state({});

	const { table } = $derived(
		useDataTable({
			columns: columnDefs,
			data: data.products,
			initialSorting: sortingState,
			initialColumnVisibility: visibilityState,
			initialGlobalFilter: globalFilterTableState,
			getRowId: (row) => row.id.toString(),
			// Add callback to save column visibility to localStorage
			onColumnVisibilityChange: (newVisibility) => {
				storageColumnVisibility.current = newVisibility;
			}
		})
	);

	$effect(() => {
		if (data.searchTerm) {
			table.setGlobalFilter(data.searchTerm);
		}
	});
	async function onAddToCart(): Promise<void> {
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

			/// Clear row selection after successful operation
			table.resetRowSelection(true);
		}
	}
	// Initialize from localStorage only once when component mounts
	onMount(() => {
		visibilityState = storageColumnVisibility.current;
	});
</script>

<Card.Root class="flex flex-1 flex-col gap-0 overflow-hidden bg-transparent py-0">
	<Card.Header class="bg-surface-1 p-3">
		<DataTableToolbar
			{table}
			bind:globalFilterTableState
			warehouses={data.warehouses}
			{onAddToCart}
		/>
	</Card.Header>
	<Separator />
	<Card.Content class="flex-1 overflow-auto px-2">
		{#await data.products}
			<p>Loading...</p>
		{:then}
			<!-- <WalkerTable {table} /> -->
			<DataTable {table} />
		{/await}
	</Card.Content>
</Card.Root>
