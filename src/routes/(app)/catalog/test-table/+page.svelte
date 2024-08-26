<script lang="ts">
	import type { ProductSchema } from '$lib/types/zod.js';
	import { writable } from 'svelte/store';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import {
		addColumnFilters,
		addHiddenColumns,
		addSelectedRows,
		addSortBy,
		addTableFilter,
		addDataExport
	} from 'svelte-headless-table/plugins';
	import {
		DataTableCheckbox,
		DataTableColumnHeader,
		DataTableRowActions,
		DataTableNameCell,
		DataTableViewErp,
		DataTableViewColumns,
		DataTableViewWarehouse
	} from './(components)/index.js';
	import StyleNumber from '$lib/style/StyleNumber.svelte';
	import Replenish from './(components)/Replenish.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';

	import ExcelJS from 'exceljs';
	import pkg from 'file-saver';
	const { saveAs } = pkg;
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: {
		products: ProductSchema[];
		warehouses: { value: number; label: string }[];
		activeWarehouse: number;
		showReplenish: boolean;
		showStock: boolean;
	};

	$: ({ products, warehouses, activeWarehouse, showReplenish, showStock } = data);

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
			pricelist: number | null;
		}[]
	): {
		m_pricelist_version_id: number;
		pricestd: number | null;
		pricelist: number | null;
	} {
		const item = pricePurchase.find((item) => item.m_pricelist_version_id === pricelistId);
		return item ?? { m_pricelist_version_id: 0, pricestd: 0, pricelist: 0 };
	}

	function getPOPrice(
		vendorId: number,
		m_product_po: {
			pricelist: number | null;
			c_bpartner_id: number;
		}[]
	): {
		c_bpartner_id: number;
		pricelist: number | null;
	} {
		const item = m_product_po.find((item) => item.c_bpartner_id === vendorId);
		return item ?? { pricelist: 0, c_bpartner_id: 0 };
	}

	const productsStore = writable(products);
	$: $productsStore = products;

	const table = createTable(productsStore, {
		select: addSelectedRows(),
		sort: addSortBy({
			toggleOrder: ['asc', 'desc']
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => {
				return value.toLowerCase().includes(filterValue.toLowerCase());
			},
			includeHiddenColumns: true
		}),
		colFilter: addColumnFilters(),
		hide: addHiddenColumns({
			initialHiddenColumnIds: ['Tax', 'MPN', 'Pack', 'Max', 'Gros']
		}),
		export: addDataExport()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'id',
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
				export: {
					exclude: true
				},
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'sku',
			header: 'SKU',
			id: 'SKU'
		}),
		table.column({
			accessor: 'mpn',
			header: 'MPN',
			id: 'MPN'
		}),

		table.column({
			accessor: 'name',
			header: 'Name',
			id: 'Name',
			cell: ({ value, row }) => {
				if (row.isData()) {
					return createRender(DataTableNameCell, {
						value,
						labelValue: row.original.discontinued
						/* class: 'w-full min-w-[100px] max-w-sm' */
					});
				}
				return value;
			}
		}),
		table.column({
			accessor: 'unitsperpack',
			id: 'Pack',
			header: 'Pack',
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'Tax',
			header: 'Tax',
			accessor: (item) => {
				const tax = item.c_taxcategory?.c_tax[0].rate;
				return tax ? tax / 100 : 0;
			},
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'percent',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'Wholesale',
			header: 'Whole.',
			accessor: (item) => getQtyOnHand(2, item.m_storageonhand),
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'Retail',
			header: 'Retail',
			accessor: (item) => getQtyOnHand(5, item.m_storageonhand),
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'level_min',
			header: 'Min',
			accessor: (item) => {
				const data = item.level_min.find((item) => item.m_warehouse_id === activeWarehouse);
				return data?.level_min ?? 0;
			},
			cell: ({ row }) => {
				if (row.isData() && row.original) {
					const levelMin = row.original.level_min.find(
						(item) => item.m_warehouse_id === activeWarehouse
					)?.level_min;
					const qty = row.original.m_storageonhand.find(
						(item) => item.warehouse_id === activeWarehouse
					)?.qtyonhand;

					return createRender(Replenish, {
						levelMin: levelMin ?? 0,
						stock: qty ?? 0,
						style: 'decimal',
						fractionDigits: 0
					});
				}
				return '';
			}
		}),
		table.column({
			id: 'Max',
			header: 'Max',
			accessor: (item) => {
				const data = item.level_max.find((item) => item.m_warehouse_id === activeWarehouse);
				return data?.level_max ?? 0;
			},
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'PricePurchase',
			header: 'Purch.',
			accessor: (item) => getPrice(5, item.priceList).pricestd,
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value ?? 0,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'PriceRetail',
			header: 'Retail',
			accessor: (item) => getPrice(13, item.priceList).pricestd,
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value ?? 0,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'Mercator',
			header: 'Mercator',
			accessor: (item) => getPOPrice(4, item.m_product_po).pricelist,
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value ?? 0,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'Mivex',
			header: 'Mivex',
			accessor: (item) => getPOPrice(89, item.m_product_po).pricelist,
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value ?? 0,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'Cenoteka',
			header: 'Cenoteka',
			accessor: (item) => getPOPrice(2, item.m_product_po).pricelist,
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value ?? 0,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'Gros',
			header: 'Gros',
			accessor: (item) => getPOPrice(407, item.m_product_po).pricelist,
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value ?? 0,
					style: 'decimal',
					fractionDigits: 2
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
			},
			plugins: {
				export: {
					exclude: true
				},
				filter: {
					exclude: true
				}
			}
		})
	]);

	const tableModel = table.createViewModel(columns, { rowDataId: (row) => row.id?.toString() });

	const { flatColumns, headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } =
		tableModel;
	$: ({ selectedDataIds } = pluginStates.select);
	const { filterValue } = pluginStates.filter;
	const { exportedData } = pluginStates.export;

	async function exportProductDataToExcel() {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet();

		// Define Header
		worksheet.addRow(Object.keys($exportedData[0]));

		// Define Body
		$exportedData.forEach((item) => {
			const rowData = Object.values(item);
			const row = worksheet.addRow(rowData);
			row.eachCell((cell) => {
				if (typeof cell.value === 'number' && cell.value < 1 && cell.value !== 0) {
					cell.numFmt = '0%';
				} else if (typeof cell.value === 'number') {
					cell.numFmt = '#,##0';
				} else if (typeof cell.value === 'string') {
					cell.numFmt = '@';
				}
			});
		});

		// Generate Excel file as a buffer
		const buffer = await workbook.xlsx.writeBuffer();

		// Save the file
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		});
		saveAs(blob, 'products_export.xlsx');
	}
</script>

<Card.Root class="grid h-full w-full grid-rows-[auto_1fr]">
	<Card.Header class="border-b p-3">
		<Card.Title>
			<div
				class="flex h-full w-full items-center justify-between overflow-hidden text-base font-normal"
			>
				<div class="flex items-center space-x-2">
					<Input
						placeholder="Filter products..."
						class="ml-1 w-[150px] lg:w-[250px]"
						type="search"
						bind:value={$filterValue}
					/>
				</div>
				<div class="flex items-center space-x-3">
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id="only-stock"
							checked={showStock}
							disabled={showReplenish}
							on:change={() => {
								let checkbox = document.getElementById('only-stock') as HTMLInputElement;
								let isChecked = checkbox.checked;

								const newUrl = new URL($page.url);
								newUrl?.searchParams?.set('stock', JSON.stringify(isChecked));
								goto(newUrl);
							}}
						/>
						<label for="only-stock">Only on Stock</label>
					</div>
					<div class="flex items-center space-x-2">
						<input
							id="show-replenish"
							type="checkbox"
							checked={showReplenish}
							on:change={(value) => {
								let checkbox = document.getElementById('show-replenish') as HTMLInputElement;
								let isChecked = checkbox.checked;
								const newUrl = new URL($page.url);
								newUrl?.searchParams?.set('rep', JSON.stringify(isChecked));
								newUrl?.searchParams?.set('stock', isChecked ? 'false' : 'true');
								goto(newUrl);
							}}
						/>
						<label for="show-replenish">Only Replenish</label>
					</div>

					<Button variant="outline" on:click={exportProductDataToExcel}>Replenish</Button>
					{#if warehouses && activeWarehouse}
						<DataTableViewWarehouse {warehouses} {activeWarehouse} />
					{/if}
					<DataTableViewErp {tableModel} />
					<DataTableViewColumns {tableModel} />
				</div>
			</div>
		</Card.Title>
	</Card.Header>
	<Card.Content class="grid h-full w-full grid-rows-[auto_1fr] overflow-hidden p-2">
		<Table.Root {...$tableAttrs} class="table-auto">
			<Table.Header class="sticky top-0 z-10 bg-background">
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										{#if cell.id !== 'select' && cell.id !== 'actions'}
											<DataTableColumnHeader {props} {tableModel} cellId={cell.id}>
												<Render of={cell.render()} />
											</DataTableColumnHeader>
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
										<Table.Cell {...attrs} class="py-2">
											<Render of={cell.render()} />
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
			<Table.Footer class="sticky bottom-0 bg-background p-2 text-muted-foreground">
				<Table.Row>
					<Table.Cell colspan={columns.length} class="text-center"
						>{Object.keys($selectedDataIds).length} of {$rows.length} row(s) selected.</Table.Cell
					>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</Card.Content>
</Card.Root>
