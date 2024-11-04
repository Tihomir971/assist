<script lang="ts">
	import {
		createSvelteTable,
		FlexRender,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		type ColumnFiltersState,
		type GlobalFilterColumn,
		type GlobalFilterTableState,
		type RowSelectionState,
		type SortingState,
		type Updater,
		type VisibilityState
	} from '$lib/components/walker-tx';
	import { createRawSnippet } from 'svelte';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	import { columnDefs } from './columns.js';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import ArrowDownUp from 'lucide-svelte/icons/arrow-down-up';

	import DataTableToolbar from './data-table-toolbar.svelte';

	let { data } = $props();
	let products = $derived(data.products);
	$inspect(products[0]);
	const rightAlignSnippet = createRawSnippet<[string]>((getValue) => {
		const value = getValue() ?? 0;
		return {
			render: () => `<div class="text-right">${value}</div>`
		};
	});

	// Define a reactive state to track the row selection state.
	let rowSelectionState: RowSelectionState = $state({});
	let sorting = $state<SortingState>([]);
	let columnVisibility = $state<VisibilityState>({});
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
			return products;
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
		},
		state: {
			get globalFilter() {
				return globalFilterTableState;
			},
			get rowSelection() {
				return rowSelectionState;
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
</script>

<Card.Root class="grid h-full w-full grid-rows-[auto_1fr]">
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
		/>
	</Card.Header>
	<Card.Content class="grid h-full w-full grid-rows-[auto_1fr] overflow-hidden p-2">
		<Table.Root class="table-auto">
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
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>

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
							<Table.Cell>
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
		</Table.Root>
	</Card.Content>
</Card.Root>
