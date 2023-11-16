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

	const { selectedDataIds } = pluginStates.select;
	$: strSelectedDataIds = Object.keys($selectedDataIds).map(Number);
</script>

<div class="grid h-full overflow-hidden grid-rows-[auto_1fr] w-full">
	<div class="flex h-full flex-col overflow-hidden px-2">
		<div class="h-12 w-full border-b border-layer-3 bg-layer-2">
			<PageHeader selectedProducts={strSelectedDataIds} />
		</div>
		<!-- SkeletonLab .table-container -->
		<Table.Root {...$tableAttrs} class="flex-grow h-full overflow-y-auto">
			<Table.Header class="table-auto bg-layer-1">
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
			<Table.Footer class="w-full min-w-full bg-layer-1 p-1 text-left">
				<Table.Row>
					<th colspan="100" class="p-2">
						{Object.keys($selectedDataIds).length} of{' '}{$rows.length} row(s) selected.
					</th>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</div>
</div>
<!-- <Drawer
	placement="right"
	transitionType="fly"
	{transitionParams}
	bind:hidden={hidden1}
	id="sidebar1"
>
	<div class="flex items-center">
		<h5
			id="drawer-label"
			class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
		>
			Contact us
		</h5>
		  <CloseButton on:click={() => (hidden3 = true)} class="mb-4 dark:text-white" />
	</div>
	<form action="#" class="mb-6">
		<div class="relative">
			<input id="email" name="email" required placeholder="name@company.com" />
			<label for="email" class="block mb-2">Your email</label>
		</div>
		<div class="relative">
			<input id="subject" name="subject" required placeholder="Let us know how we can help you" />
			<label for="subject" class="block mb-2">Subject</label>
		</div>
		<div class="relative">
			<textarea id="message" placeholder="Your message..." rows="4" name="message" />
			<label for="message" class="mb-2">Your message</label>
		</div>
		<button type="submit" class="w-full">Send message</button>
	</form>
	<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
		<a href="/" class="text-primary-600 hover:underline dark:text-primary-500">info@company.com</a>
	</p>
	<p class="text-sm text-gray-500 dark:text-gray-400">
		<a href="/" class="text-primary-600 hover:underline dark:text-primary-500">212-456-7890</a>
	</p>
</Drawer> -->
