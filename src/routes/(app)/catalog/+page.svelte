<script lang="ts">
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';

	/* import Actions from './actions-product.doc'; */
	import Actions2 from './TableAction.svelte';
	import NumberFormat from '$lib/components/table/NumberFormat.svelte';
	import TextRight from '$lib/components/table/TextRight.svelte';
	import PageHeader from './PageHeader.svelte';
	import Checkbox from '$lib/components/table/Checkbox.svelte';
	import * as Table from '$lib/components/table';

	export let data: PageData;
	const onStock = data.onStock;
	import { createTable, createRender, Subscribe, Render } from 'svelte-headless-table';
	import {
		addColumnFilters,
		addHiddenColumns,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import { numberFormat } from '$lib/scripts/format';
	const products = writable(data.products);
	$: $products = data.products;

	const table = createTable(products, {
		sort: addSortBy({ disableMultiSort: true }),
		/* page: addPagination({ initialPageSize: 17 }), */
		tableFilter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns()
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
				}
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
				}
			}
		}),
		table.column({ header: 'Barcode', accessor: 'barcode' }),
		table.column({
			header: 'MPN',
			accessor: 'mpn',
			cell: ({ value }) => `${value ?? ''}`
		}),
		table.column({ header: 'Name', accessor: 'name' }),

		//Extracted Qty фро њарехоусе
		/* 		table.column({
			header: createRender(TextRight, { text: 'Qty.' }),
			accessor: 'qtyonhand',
			cell: ({ value }) =>
				createRender(NumberFormat, {
					value: value,
					locales: 'sr-Latn',
					style: 'decimal',
					fractionDigits: 2
				})
		}), */
		//Еџперимент
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
						})
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
						})
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
						})
				}),
				table.column({
					id: 'ruc',
					accessor: (item) => item,
					header: 'RuC',
					cell: ({ value }) =>
						createRender(NumberFormat, {
							value: value.priceRetail / value.pricePurchase - 1,
							locales: 'sr-Latn',
							style: 'percent',
							fractionDigits: 1
						})
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
						})
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
						})
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
						})
				})
			]
		}),
		table.column({
			header: '',
			accessor: ({ id }) => id,
			/* cell: ({ value }) => value */
			cell: ({ value }) => createRender(Actions2, { id: value.toString() })
		})
	]);
	//Create View Model
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns, {
			rowDataId: (row) => row.id?.toString()
		});

	let { selectedDataIds } = pluginStates.select;
	const { filterValue } = pluginStates.tableFilter;
	$: $products, ($selectedDataIds = {});
	$: strSelectedDataIds = Object.keys($selectedDataIds).map(Number);
</script>

<div class="grid h-full w-full grid-rows-[auto_1fr] overflow-hidden">
	<div class="flex h-full flex-col overflow-hidden px-2">
		<div class="border-layer-3 bg-layer-2 flex h-14 w-full flex-col border-b">
			<PageHeader selectedProducts={strSelectedDataIds} {onStock} bind:filterValue={$filterValue} />
		</div>
		<Table.Root {...$tableAttrs}>
			<!-- <Table.Root {...$tableAttrs} class="h-full flex-grow overflow-y-auto"> -->
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
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
			<Table.Footer class="bg-layer-1 w-full min-w-full p-1 text-left">
				<Table.Row>
					<th colspan="100" class="p-2">
						{Object.keys($selectedDataIds).length} of{' '}{$rows.length} row(s) selected.
					</th>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</div>
</div>
<div class="text-muted-foreground flex-1 text-sm">
	{$selectedDataIds}
</div>
