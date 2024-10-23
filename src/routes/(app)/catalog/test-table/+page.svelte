<script lang="ts">
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
	import * as Table from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import type { FlattenedProduct } from './+page.server.js';
	import { getShoppingCartState } from '$lib/components/cart/cart-state.svelte.js';

	export let data: {
		products: FlattenedProduct[];
		warehouses: { value: number; label: string }[];
		activeWarehouse: number;
		showStock: boolean;
		showVat: boolean;
	};

	const shoppingCartState = getShoppingCartState();
	$: ({ products, warehouses, activeWarehouse, showStock, showVat } = data);

	const productsStore = writable(products);
	$: $productsStore = products;

	let initialHiddenColumnIds = ['Tax', 'MPN', 'Pack', 'Max', 'Gros'];

	if (browser) {
		const storedHiddenColumns = localStorage.getItem('hiddenColumns');
		if (storedHiddenColumns) {
			initialHiddenColumnIds = JSON.parse(storedHiddenColumns);
		}
	}

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
			initialHiddenColumnIds
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
			id: 'taxRate',
			header: 'Tax',
			accessor: 'taxRate',
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'percent',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'qtyWholesale',
			header: 'Whole.',
			accessor: 'qtyWholesale',
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
		}),
		table.column({
			id: 'qtyRetail',
			header: 'Retail',
			accessor: 'qtyRetail',
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
			accessor: 'levelMin',
			cell: ({ row }) => {
				if (row.isData()) {
					const levelMin = row.original.levelMin ?? 0;
					const qtyRetail = row.original.qtyRetail ?? 0;
					return createRender(StyleNumber, {
						value: levelMin,
						danger: qtyRetail < levelMin,
						style: 'decimal',
						fractionDigits: 0
					});
				}
				return '';
			}
		}),
		table.column({
			id: 'levelMax',
			header: 'Max',
			accessor: 'levelMax',
			cell: ({ value }) =>
				value != null
					? createRender(StyleNumber, {
							value,
							style: 'decimal',
							fractionDigits: 0
						})
					: ''
		}),
		table.column({
			id: 'PricePurchase',
			header: 'Purch.',
			accessor: 'pricePurchase',
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value ?? 0,
					style: 'decimal',
					fractionDigits: 2
				})
		}),
		table.column({
			id: 'ruc',
			header: 'RuC',
			accessor: 'ruc',
			cell: ({ value }) =>
				createRender(StyleNumber, {
					value: value,
					style: 'percent',
					fractionDigits: 1
				})
		}),

		table.column({
			id: 'PriceRetail',
			header: 'Retail',
			accessor: 'priceRetail',
			cell: ({ row }) => {
				if (row.isData()) {
					const priceRetail = row.original.priceRetail ?? 0;
					const priceCenoteka = row.original.priceCenoteka ?? 0;
					const qtyRetail = row.original.qtyRetail ?? 0;
					return createRender(StyleNumber, {
						action: row.original.action,
						value: priceRetail,
						danger:
							priceCenoteka !== 0 &&
							qtyRetail > 0 &&
							priceRetail > priceCenoteka &&
							(priceRetail - priceCenoteka) / priceCenoteka >= 0.05,
						style: 'decimal',
						fractionDigits: 2
					});
				}
				return '';
			}
		}),

		table.column({
			id: 'Agrofina',
			header: 'Agrofina',
			accessor: 'priceAgrofina',
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
			accessor: 'priceMercator',
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
			accessor: 'priceMivex',
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
			accessor: 'priceCenoteka',
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
			accessor: 'priceGros',
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

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } = tableModel;
	const { selectedDataIds } = pluginStates.select;
	const { filterValue } = pluginStates.filter;
	const { exportedData } = pluginStates.export;

	type CartItem = {
		id: string | number;
		name: string;
		quantity: number;
		sku: string;
	};

	function addToCart(): void {
		if (browser) {
			console.log('Shopping Cart State:', shoppingCartState); // Add this line to log the state
			console.log('All rows:', $rows);

			const selectedProducts = $rows.filter((row) => {
				if (row.isData()) {
					return $selectedDataIds[row.original.id];
				}
				return false;
			});
			console.log('Selected products:', selectedProducts);

			let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cartItems') || '[]');

			selectedProducts.forEach((row) => {
				if (row.isData()) {
					const product = row.original;
					console.log('Adding product to cart:', product);
					const existingItem = cartItems.find((item) => item.id === product.id);
					if (existingItem) {
						existingItem.quantity += 1;
					} else {
						shoppingCartState.add(product.id, product.name, 1, product.sku);

						cartItems.push({
							id: product.id,
							name: product.name,
							quantity: 1,
							sku: product.sku
						});
					}
				}
			});

			localStorage.setItem('cartItems', JSON.stringify(cartItems));
			$selectedDataIds = {};
		}
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
							type="checkbox"
							id="show-vat"
							checked={showVat}
							on:change={(e) => {
								showVat = (e.target as HTMLInputElement).checked;
								const newUrl = new URL($page.url);
								newUrl.searchParams.set('showVat', showVat.toString());
								goto(newUrl);
							}}
						/>
						<label for="show-vat">Show VAT</label>
					</div>
					<Button variant="outline" on:click={addToCart}>Add to Cart</Button>
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
