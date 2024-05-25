<script lang="ts">
	import type { PageData } from './$types';
	import { get, writable } from 'svelte/store';

	import TableAction from './TableAction.svelte';
	import NumberFormat from '$lib/components/table/NumberFormat.svelte';
	import TextRight from '$lib/components/table/TextRight.svelte';
	import PageHeader from './PageHeader.svelte';
	import Checkbox from '$lib/components/table/Checkbox.svelte';
	//	import * as Table from '$lib/components/table';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import PhBasket from '$lib/icons/PhBasket.svelte';
	import PhCurrencyEur from '$lib/icons/PhCurrencyEur.svelte';
	import PhFactory from '$lib/icons/PhFactory.svelte';

	export let data: PageData;
	let onStock = data.onStock;

	import { createTable, createRender, Subscribe, Render } from 'svelte-headless-table';
	import {
		addDataExport,
		addHiddenColumns,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

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

	const onStockChange = () => {
		const newUrl = new URL($page.url);
		onStock = !onStock;
		newUrl?.searchParams?.set('onStock', onStock.toString());

		if (browser) {
			goto(`${newUrl.origin}/catalog${newUrl.search}`);
		}
		return;
	};
	async function addToBasket() {
		const apiUrl = '/api/basket/add/';

		for (let index = 0; index < strSelectedDataIds.length; index++) {
			try {
				const response = await fetch(apiUrl, {
					method: 'POST',
					body: JSON.stringify({ id: strSelectedDataIds[index] }),
					headers: {
						'content-type': 'application/json'
					}
				});

				if (response.status === 200) {
					toast.success('Add product to basket', {
						description: 'Product added to basket!'
					});
				} else if (response.status === 204) {
					toast.error('Add product to basket', {
						description: 'Error adding to basket'
					});
				}
			} catch (error) {
				console.log('error', error);
			}
		}
	}
	async function getPrices() {
		for (let index = 0; index < strSelectedDataIds.length; index++) {
			const element = strSelectedDataIds[index];

			const response = await fetch(`/api/scraper/getPrice2/${element}`);
			const serverResponse = await response.json();

			if (serverResponse.code === 'warning') {
				toast.warning('Market Prices Warning', {
					description: `${serverResponse.message}`
				});
			} else {
				toast.success('Market Prices updated!', {
					description: `Market  price for "${serverResponse.message}" updated`
				});
			}
		}
		invalidate('catalog:products');
	}
	async function getERPnew() {
		for (const item of strSelectedDataIds) {
			fetch(`/api/erp/getProduct?ID=${item}`).then((response) => {
				if (response.status === 200) {
					toast.success('ERP Prices updated!', {
						description: `ERP price for "${item}" updated`
					});
				}
			});
			console.log(item);
		}
		invalidate('catalog:products');
	}
</script>

<div class="flex items-center justify-between border-b border-muted-foreground bg-muted/70 p-4">
	<!-- <div class="grid h-full w-full grid-rows-[auto_1fr] overflow-hidden"> -->
	<!-- <div class="flex h-full flex-col overflow-hidden px-2"> -->
	<Input
		class="max-w-sm"
		placeholder="Filter products..."
		type="text"
		bind:value={$filterValue}
		autocomplete="off"
	/>
	<div class="flex items-center space-x-2">
		<Label for="show-stock">On Stock:</Label>
		<Switch id="show-stock" checked={onStock} onCheckedChange={onStockChange} />
	</div>
	<div class="flex">
		<!-- <PageHeader selectedProducts={strSelectedDataIds} /> -->
		<Button variant="outline" on:click={() => console.log(get(exportedCsv))}>Export as CSV</Button>
		<Button variant="outline" on:click={addToBasket}
			><PhBasket class="mr-2 size-5" />Add to Basket</Button
		>
		<Button variant="outline" on:click={getPrices}
			><PhCurrencyEur class="mr-2 size-5" />Get Prices</Button
		>
		<form method="POST" action="/catalog?/getErpProductInfo">
			<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
			<Button variant="outline" type="submit"><PhFactory class="mr-2 size-5" />Get ERP</Button>
		</form>
	</div>
</div>
<Table.Root {...$tableAttrs} class="border">
	<Table.Header class="sticky top-0 bg-muted">
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
