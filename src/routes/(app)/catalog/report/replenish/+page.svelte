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
<!-- <Table.Root class="table-auto">
	<Table.Header class="bg-well-2 sticky top-0 z-10">
		<Table.Row>
			{#each table.getHeaderGroups() as headerGroup}
				{#each headerGroup.headers as header}
					<Table.Head>
						<button
							type="button"
							class="flex items-center justify-between"
							class:cursor-pointer={header.column.getCanSort()}
							class:select-none={header.column.getCanSort()}
							onclick={header.column.getToggleSortingHandler()}
						>
							<FlexRender content={header.column.columnDef.header} context={header.getContext()} />

							{#if header.column.getCanSort()}
								<span class="ml-1">
									{#if header.column.getIsSorted() === 'asc'}
										<ArrowUp size="14" class="text-ink-1" />
									{:else if header.column.getIsSorted() === 'desc'}
										<ArrowDown size="14" class="text-ink-1" />
									{:else}
										<ArrowDownUp size={14} />
									{/if}
								</span>
							{/if}
						</button>
					</Table.Head>
				{/each}
			{/each}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each table.getRowModel().rows as row (row.id)}
			<Table.Row data-state={row.getIsSelected() && 'selected'}>
				{#each row.getVisibleCells() as cell (cell.id)}
					<Table.Cell class="py-2">
						<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
					</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
	</Table.Body>
	<Table.Footer class="bg-well-2 text-muted-foreground sticky bottom-0 z-10">
		<Table.Row>
			<Table.Cell colspan={table.getVisibleFlatColumns().length} class="h-12 py-0 text-center">
				{table.getSelectedRowModel().rows.length} of {table.getRowCount()}
				row(s) selected.
			</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root> -->
