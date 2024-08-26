<script lang="ts">
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';

	import TableAction from './TableAction.svelte';
	import NumberFormat from '$lib/components/table/NumberFormat.svelte';
	import TextRight from '$lib/components/table/TextRight.svelte';
	import Checkbox from '$lib/components/table/Checkbox.svelte';
	//	import * as Table from '$lib/components/table';
	import * as Table from '$lib/components/ui/table';

	export let data: PageData;

	import { createTable, createRender, Subscribe, Render } from 'svelte-headless-table';
	import {
		addDataExport,
		addHiddenColumns,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import { goto } from '$app/navigation';

	const products = writable(data.products);
	$: $products = data.products;

	const table = createTable(products, {
		sort: addSortBy({ disableMultiSort: true }),
		/* page: addPagination({ initialPageSize: 17 }), */
		tableFilter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns(),
		exportCsv: addDataExport({
			format: 'csv'
		})
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
		}),
		table.group({
			header: 'Stock',
			columns: [
				table.column({
					id: 'wholesale',
					header: createRender(TextRight, { text: 'Wholesale' }),
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
					header: createRender(TextRight, { text: 'Retail' }),
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
					header: createRender(TextRight, { text: 'Purch.' }),
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
					header: createRender(TextRight, { text: 'RuC' }),
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
					header: createRender(TextRight, { text: 'Retail' }),
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
					header: createRender(TextRight, { text: 'Market' }),
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
					header: createRender(TextRight, { text: 'Recom.' }),
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
					goto(`/catalog/products/${ev.detail.id.toString()}`)
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

	$: $products, ($selectedDataIds = {});
</script>

<Table.Root {...$tableAttrs} class="">
	<Table.Header class="sticky top-0">
		{#each $headerRows as headerRow}
			<Subscribe rowAttrs={headerRow.attrs()} rowProps={headerRow.props()} let:rowProps>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<Table.Head {...attrs}>
								<Render of={cell.render()} />
							</Table.Head>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Header>
	<Table.Body {...$tableBodyAttrs}>
		{#each $pageRows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<Table.Cell {...attrs}>
								<Render of={cell.render()} />
							</Table.Cell>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Body>
	<Table.Footer class="sticky bottom-0 bg-muted">
		<Table.Row>
			<th colspan="100" class="p-2">
				{Object.keys($selectedDataIds).length} of{' '}{$rows.length} row(s) selected.
			</th>
		</Table.Row>
	</Table.Footer>
</Table.Root>
