<script lang="ts">
	import { get, readable, writable } from 'svelte/store';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import {
		addColumnFilters,
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import {
		DataTableCheckbox,
		DataTableColumnHeader,
		DataTablePagination,
		DataTablePriorityCell,
		DataTableRowActions,
		DataTableStatusCell,
		DataTableTitleCell,
		DataTableToolbar
	} from './(components)/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import Number from '../replenish/data-table/Number.svelte';
	import Right from '../replenish/data-table/Right.svelte';

	export let data;
	const tableData = writable(data.products);
	$: $tableData = data.products;

	function getQtyOnHand(
		warehouse_id: number,
		productStorage: {
			warehouse_id: number;
			qtyonhand: number;
		}[]
	): number {
		const item = productStorage.find((item) => item.warehouse_id === warehouse_id);

		return item ? item.qtyonhand : 0;
	}
	function getPrice(
		pricelistId: number,
		pricePurchase: {
			m_pricelist_version_id: number;
			pricestd: number | null;
		}[]
	): number {
		const item = pricePurchase.find((item) => item.m_pricelist_version_id === pricelistId);
		return item ? item.pricestd ?? 0 : 0;
	}

	const table = createTable(tableData, {
		select: addSelectedRows(),
		sort: addSortBy({
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => {
				return value.toLowerCase().includes(filterValue.toLowerCase());
			}
		}),
		colFilter: addColumnFilters(),
		hide: addHiddenColumns()
	});

	const columns = table.createColumns([
		table.display({
			id: 'select',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected,
					'aria-label': 'Select all'
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);
				return createRender(DataTableCheckbox, {
					checked: isSelected,
					'aria-label': 'Select row',
					class: 'translate-y-[2px]'
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),

		table.column({
			accessor: 'sku',
			header: 'SKU',
			id: 'sku'
			/* cell: ({ value, row }) => {
				if (row.isData()) {
					return createRender(DataTableTitleCell, {
						value,
						labelValue: row.original.barcode ?? ''
					});
				}
				return value;
			} */
		}),
		table.column({
			accessor: 'barcode',
			header: 'Barcode',
			id: 'barcode'
		}),
		table.column({
			accessor: 'name',
			header: 'Name',
			id: 'name',
			cell: ({ value, row }) => {
				if (row.isData()) {
					return createRender(DataTableTitleCell, {
						value,
						labelValue: row.original.barcode ?? ''
					});
				}
				return value;
			}
		}),
		table.column({
			accessor: 'unitsperpack',
			id: 'unitsperpack',
			header: 'unitsperpack'
		}),
		table.column({
			id: 'c_tax-number',
			header: 'Tax',
			accessor: (item) => {
				const tax = item.c_taxcategory?.c_tax[0].rate;
				return tax ? tax / 100 : 0;
			},
			cell: ({ value }) =>
				createRender(Number, {
					value: value,
					style: 'percent',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'wholesale-number',
			header: 'Stock',
			accessor: (item) => getQtyOnHand(5, item.m_storageonhand),
			cell: ({ value }) =>
				createRender(Number, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'pricePurchase-number',
			header: 'Purch.',
			accessor: (item) => getPrice(5, item.priceList),
			//accessor: 'pricePurchase',
			cell: ({ value }) =>
				createRender(Number, {
					value: value,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'priceMarket-number',
			header: 'Mark.',
			accessor: (item) => getPrice(15, item.priceList),
			//accessor: 'pricePurchase',
			cell: ({ value }) =>
				createRender(Number, {
					value: value,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'level_min-number',
			header: createRender(Right, { text: 'Min' }),
			accessor: (item) => {
				const data = item.level_min.find((item) => item.m_warehouse_id === 5);
				return data?.level_min ?? 0;
			},
			cell: ({ value }) =>
				createRender(Number, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'level_max-number',
			header: 'Max',
			accessor: (item) => {
				const data = item.level_max.find((item) => item.m_warehouse_id === 5);
				return data?.level_max ?? 0;
			},
			cell: ({ value }) =>
				createRender(Number, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.display({
			id: 'actions',
			header: () => {
				return '';
			},
			cell: ({ row }) => {
				if (row.isData() && row.original) {
					return createRender(DataTableRowActions, {
						row: row.original
					});
				}
				return '';
			}
		})
	]);

	const tableModel = table.createViewModel(columns);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = tableModel;
</script>

<div class="space-y-4">
	<!-- <DataTableToolbar {tableModel} {data} /> -->
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										{#if cell.id !== 'select' && cell.id !== 'actions'}
											<DataTableColumnHeader {props} {tableModel} cellId={cell.id}>
												<Render of={cell.render()} /></DataTableColumnHeader
											>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#if $pageRows.length}
					{#each $pageRows as row (row.id)}
						<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
							<Table.Row {...rowAttrs}>
								{#each row.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs>
										<Table.Cell {...attrs}>
											{#if cell.id === 'task'}
												<div class="w-[80px]">
													<Render of={cell.render()} />
												</div>
											{:else}
												<Render of={cell.render()} />
											{/if}
										</Table.Cell>
									</Subscribe>
								{/each}
							</Table.Row>
						</Subscribe>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination {tableModel} />
</div>
