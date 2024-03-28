<script lang="ts">
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';

	import TableAction from './TableAction.svelte';
	import NumberFormat from '$lib/components/table/NumberFormat.svelte';
	import TextRight from '$lib/components/table/TextRight.svelte';
	import Checkbox from '$lib/components/table/Checkbox.svelte';

	export let data: PageData;
	const onStock = data.onStock;

	import { createTable, createRender, Subscribe, Render } from 'svelte-headless-table';
	import {
		addDataExport,
		addColumnFilters,
		addColumnOrder,
		addHiddenColumns,
		addSortBy,
		addTableFilter,
		addPagination,
		addExpandedRows,
		matchFilter,
		numberRangeFilter,
		textPrefixFilter,
		addSubRows,
		addGroupBy,
		addSelectedRows,
		addResizedColumns
	} from 'svelte-headless-table/plugins';
	import { goto } from '$app/navigation';

	const products = writable(data.products);
	$: $products = data.products;

	const table = createTable(products, {
		filter: addColumnFilters(),
		sort: addSortBy({ disableMultiSort: true }),
		/* page: addPagination({ initialPageSize: 17 }), */
		tableFilter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns(),
		exportCsv: addDataExport({
			format: 'csv'
		}),
		resize: addResizedColumns()
	});

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

	//Create table columns
	let columns = table.createColumns([
		table.group({
			header: '',
			columns: [
				table.column({
					accessor: 'id',
					header: (_, { pluginStates }) => {
						const { allPageRowsSelected, someRowsSelected } = pluginStates.select;
						return createRender(Checkbox, {
							isSelected: allPageRowsSelected,
							isSomeSubRowsSelected: someRowsSelected
						});
					},
					cell: ({ row }, { pluginStates }) => {
						const { getRowState } = pluginStates.select;
						const { isSelected, isSomeSubRowsSelected } = getRowState(row);
						return createRender(Checkbox, {
							isSelected: isSelected,
							isSomeSubRowsSelected: isSomeSubRowsSelected
						});
					},
					plugins: {
						sort: {
							disable: true
						},
						tableFilter: {
							exclude: true
						},
						exportCsv: { exclude: false }
					}
				}),

				table.column({
					header: 'SKU',
					accessor: 'sku',
					plugins: {
						sort: {},
						tableFilter: {
							getFilterValue(value) {
								return value.toLowerCase();
							}
						},
						exportCsv: { exclude: false }
					}
				}),
				table.column({
					header: 'Barcode',
					accessor: 'barcode',
					cell: ({ value }) => `${value ?? ''}`,
					plugins: {
						exportCsv: { exclude: true }
					}
				}),
				table.column({
					header: 'MPN',
					accessor: 'mpn',
					cell: ({ value }) => `${value ?? ''}`,
					plugins: {
						exportCsv: { exclude: true }
					}
				}),
				table.column({
					header: 'Name',
					accessor: 'name',
					plugins: {
						exportCsv: { exclude: true }
					}
				})
			]
		}),
		table.group({
			header: 'Stock',
			columns: [
				table.column({
					id: 'wholesale',
					header: 'Wholesale',
					/* header: createRender(TextRight, { text: 'Wholesale' }), */
					accessor: (item) => getQtyOnHand(2, item.m_storageonhand),
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value,
							locales: 'sr-Latn',
							style: 'decimal',
							fractionDigits: 2
						}),
					plugins: {
						exportCsv: { exclude: true },
						tableFilter: { exclude: true }
					}
				}),
				table.column({
					id: 'retail',
					header: 'Retail',
					/* header: createRender(TextRight, { text: 'Retail' }), */
					accessor: (item) => getQtyOnHand(5, item.m_storageonhand),
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value,
							locales: 'sr-Latn',
							style: 'decimal',
							fractionDigits: 2
						}),
					plugins: {
						exportCsv: { exclude: true },
						tableFilter: { exclude: true }
					}
				})
			]
		}),
		table.group({
			header: 'Price',
			columns: [
				table.column({
					id: 'purchase',
					header: 'Purch.',
					/* header: createRender(TextRight, { text: 'Purch.' }), */
					accessor: 'pricePurchase',
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value,
							locales: 'sr-Latn',
							style: 'decimal',
							fractionDigits: 2
						}),
					plugins: {
						exportCsv: { exclude: true },
						tableFilter: { exclude: true }
					}
				}),
				table.column({
					id: 'ruc',
					accessor: (item) => item,
					header: 'RuC',
					/* header: createRender(TextRight, { text: 'RuC' }), */
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value.priceRetail / value.pricePurchase - 1,
							locales: 'sr-Latn',
							style: 'percent',
							fractionDigits: 1
						}),
					plugins: {
						exportCsv: { exclude: true },
						tableFilter: { exclude: true }
					}
				}),
				table.column({
					header: 'Retail',
					/* header: createRender(TextRight, { text: 'Retail' }), */
					accessor: 'priceRetail',
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value,
							locales: 'sr-Latn',
							style: 'decimal',
							fractionDigits: 2
						}),
					plugins: {
						exportCsv: { exclude: true },
						tableFilter: { exclude: true }
					}
				}),
				table.column({
					header: 'Market',
					/* header: createRender(TextRight, { text: 'Market' }), */
					accessor: 'priceMarket',
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value,
							locales: 'sr-Latn',
							style: 'decimal',
							fractionDigits: 2
						}),
					plugins: {
						exportCsv: { exclude: true },
						tableFilter: { exclude: true }
					}
				}),
				table.column({
					/* header: createRender(TextRight, { text: 'Recom.' }), */
					header: 'Recom.',
					accessor: 'priceRecommended',
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value,
							locales: 'sr-Latn',
							style: 'decimal',
							fractionDigits: 2
						}),
					plugins: {
						exportCsv: { exclude: true },
						tableFilter: { exclude: true }
					}
				})
			]
		}),
		table.column({
			header: '',
			accessor: ({ id }) => id,
			/* cell: ({ value }) => value */
			cell: ({ value }) =>
				createRender(TableAction, { id: value }).on('click', (ev) =>
					goto(`/catalog/product/${ev.detail.id.toString()}`)
				),
			plugins: {
				exportCsv: { exclude: true }
			}
		})
	]);

	//Create View Model
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns, {
			rowDataId: (row) => row.id?.toString()
		});

	let { selectedDataIds } = pluginStates.select;
	const { filterValue } = pluginStates.tableFilter;
	const { exportedData: exportedCsv } = pluginStates.exportCsv;

	$: $products, ($selectedDataIds = {});
	$: strSelectedDataIds = Object.keys($selectedDataIds).map(Number);
</script>

<div class="overflow-x-auto">
	<table {...$tableAttrs} class="table table-sm">
		<thead>
			{#each $headerRows as headerRow (headerRow.id)}
				<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
					<tr {...rowAttrs}>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<th
									{...attrs}
									on:click={props.sort.toggle}
									class="border-r border-solid border-black text-center"
								>
									<!-- <div class="flex items-center justify-center"> -->
									<Render of={cell.render()} />
									{#if props.sort.order === 'asc'}
										<iconify-icon icon="ph:sort-ascending" width="1rem" height="1rem"
										></iconify-icon>
									{:else if props.sort.order === 'desc'}
										<iconify-icon icon="ph:sort-descending" width="1rem" height="1rem"
										></iconify-icon>
									{/if}
									<!-- </div> -->
								</th>
							</Subscribe>
						{/each}
					</tr>
				</Subscribe>
			{/each}
		</thead>
		<tbody {...$tableBodyAttrs}>
			{#each $rows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<tr {...rowAttrs} class="hover">
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<td {...attrs}>
									<!-- <div class="flex"> -->
									<Render of={cell.render()} />
									<!-- </div> -->
								</td>
							</Subscribe>
						{/each}
					</tr>
				</Subscribe>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table {
		border-spacing: 0;
		border-top: 1px solid black;
		border-left: 1px solid black;
	}
	th,
	td {
		border-bottom: 1px solid black;
		/* border-right: 1px solid black; */
		/* padding: 0.5rem; */
	}

	/* 	:where(table) {
		width: fit-content;
		border: 1px solid var(--surface-2);
		background: var(--surface-2);
		border-radius: var(--radius-3);

		--nice-inner-radius: calc(var(--radius-3) - 2px);
	}

	:where(table:not(:has(tfoot)) tr:last-child td:first-child) {
		border-end-start-radius: var(--nice-inner-radius);
	}

	:where(table:not(:has(tfoot)) tr:last-child td:last-child) {
		border-end-end-radius: var(--nice-inner-radius);
	}

	:where(table thead tr:first-child th:first-child) {
		border-start-start-radius: var(--nice-inner-radius);
	}

	:where(table thead tr:first-child th:last-child) {
		border-start-end-radius: var(--nice-inner-radius);
	}

	:where(tfoot tr:last-child :is(th, td):first-of-type) {
		border-end-start-radius: var(--nice-inner-radius);
	}

	:where(tfoot tr:last-child :is(th, td):last-of-type) {
		border-end-end-radius: var(--nice-inner-radius);
	}

	:where(th) {
		color: var(--text-1);
		background-color: var(--surface-2);
	}

	:where(table :is(a, button, [contenteditable]):is(:focus-visible)) {
		outline-offset: -2px;
	}

	:where(td) {
		background: var(--surface-1);
		max-inline-size: var(--size-content-2);
		text-wrap: pretty;
	}

	:where(td, th) {
		text-align: left;
		padding: var(--size-2);
	}

	:where(:is(td, th):not([align])) {
		text-align: center;
	}

	:where(thead) {
		border-collapse: collapse;
	}

	:where(table tr:hover td),
	:where(tbody tr:nth-child(even):hover td) {
		background-color: var(--gray-10);

		@media (prefers-color-scheme: light) {
			background-color: white;
		}
	}

	:where(table > caption) {
		margin: var(--size-3);
	}

	:where(tfoot button) {
		padding-block: var(--size-1);
		padding-inline: var(--size-3);
	} */
</style>
