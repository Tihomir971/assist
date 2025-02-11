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
		type Updater
	} from '$lib/components/walker-tx/index.js';
	import { columnDefs } from './table-columns.svelte.js';
	import WalkerTable from '$lib/components/walker-tx/WalkerTable.svelte';

	let { data } = $props();

	//let storageCartItems = getContext<LocalStorage<CartItem[]>>('cartItems');
	// Define a reactive state to track the row selection state.
	let rowSelectionState: RowSelectionState = $state({});
	let sorting = $state<SortingState>([]);
	let globalFilterTableState = $state<GlobalFilterTableState>();
	function onRowSelectionChange(updater: Updater<RowSelectionState>) {
		// Update the selection state by reassigning the $state
		if (updater instanceof Function) {
			rowSelectionState = updater(rowSelectionState);
		} else {
			rowSelectionState = updater;
		}
	}

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
		state: {
			get rowSelection() {
				return rowSelectionState;
			},
			get globalFilter() {
				return globalFilterTableState;
			},
			get sorting() {
				return sorting;
			}
		},
		getRowId: (originalRow) => originalRow.id.toString()
	});
</script>

<WalkerTable {table} />
