<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import type { PageData } from './$types';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import { goto, invalidate } from '$app/navigation';
	import TableAction from '../TableAction.svelte';
	import { Button } from '$lib/components/ui/button';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Actions from './data-table/data-table-actions.svelte';
	import DataTableCheckbox from './data-table/data-table-checkbox.svelte';
	import Number from './data-table/Number.svelte';
	import Right from './data-table/Right.svelte';
	import { cn } from '$lib/utils.js';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import {
		addDataExport,
		addHiddenColumns,
		addResizedColumns,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import * as Table from '$lib/components/ui/table';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';

	export let data: PageData;
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
	function getPrice2(
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
		sort: addSortBy({ disableMultiSort: true }),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		select: addSelectedRows(),
		exportCsv: addDataExport({
			format: 'csv'
		}),
		hide: addHiddenColumns(),
		resize: addResizedColumns()
	});

	const columns = table.createColumns([
		table.column({
			/* id: 'id', */
			accessor: 'id',
			header: (_, { pluginStates }) => {
				const { allRowsSelected, someRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
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
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: false
				}
			}
		}),
		table.column({
			accessor: 'barcode',
			header: 'Barcode'
		}),
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			id: 'unitsperpack-number',
			header: 'Pack.',
			accessor: 'unitsperpack',
			cell: ({ value }) =>
				createRender(Number, {
					value: value,
					style: 'decimal',
					fractionDigits: 0
				})
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

		table.column({
			id: 'actions',
			header: '',
			accessor: ({ id }) => id,
			/* cell: ({ value }) => value */
			cell: ({ value }) =>
				createRender(Actions, { id: value.toString() }).on('click', (ev) =>
					goto(`/catalog/product/${ev.detail.id.toString()}`)
				),
			plugins: {
				exportCsv: { exclude: true },
				sort: {
					disable: true
				}
			}
		})
	]);
	const { headerRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns, { rowDataId: (row) => row.id?.toString() });
	const { sortKeys } = pluginStates.sort;

	const { hiddenColumnIds } = pluginStates.hide;
	const ids = flatColumns.map((c) => c.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, true]));
	const hideableCols = ['sku', 'email', 'amount'];
	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);

	const { selectedDataIds } = pluginStates.select;
	const { filterValue } = pluginStates.filter;
	let formElErpSyncProd: HTMLFormElement;
	let formElErp: HTMLFormElement;
	$: strSelectedDataIds = Object.keys($selectedDataIds).map((x) => parseInt(x));
	$: $tableData, ($selectedDataIds = {});

	const submitSyncStock: SubmitFunction = ({}) => {
		return async ({ result }) => {
			if (result.type === 'success') {
				// do something...
				toast.success('Replenish ERP Sync', {
					description: `Successfully updated!`,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});
			} else if (result.type === 'error') {
				toast.error('Replenish ERP Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
			// use the default behavior for this result type
			await invalidate('catalog:replenish');
		};
	};
</script>

<div class="flex items-center border-b border-muted-foreground bg-muted p-4">
	<Input
		class="max-w-sm"
		placeholder="Filter products..."
		type="text"
		bind:value={$filterValue}
		autocomplete="off"
	/>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" class="ml-auto" builders={[builder]}>
				ERP <ChevronDown class="ml-2 h-4 w-4" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<form
				method="POST"
				action="/catalog?/getErpInfo"
				use:enhance={submitSyncStock}
				bind:this={formElErpSyncProd}
			>
				<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
				<DropdownMenu.Item
					on:click={() => {
						formElErpSyncProd.requestSubmit();
					}}
				>
					Sync Replenish from ERP
				</DropdownMenu.Item>
			</form>
			<form
				method="POST"
				action="/catalog?/getErpInfo"
				use:enhance={submitSyncStock}
				bind:this={formElErp}
			>
				<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
				<DropdownMenu.Item
					on:click={() => {
						formElErp.requestSubmit();
					}}
				>
					Sync Stock
				</DropdownMenu.Item>
			</form>
			<form method="POST" action="/catalog?/getErpInfo" use:enhance bind:this={formElErp}>
				<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
				<DropdownMenu.Item
					on:click={() => {
						formElErp.requestSubmit();
					}}
				>
					Sync Replenish
				</DropdownMenu.Item>
			</form>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" class="ml-auto" builders={[builder]}>
				Columns <ChevronDown class="ml-2 h-4 w-4" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each flatColumns as col}
				{#if hideableCols.includes(col.id)}
					<DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
						{col.header}
					</DropdownMenu.CheckboxItem>
				{/if}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
<Table.Root {...$tableAttrs} class="border">
	<Table.Header class="sticky top-0 bg-muted">
		{#each $headerRows as headerRow}
			<Subscribe rowAttrs={headerRow.attrs()}>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<Table.Head {...attrs} class={cn('[&:has([role=checkbox])]:pl-3')}>
								{#if cell.id === 'id'}
									<Render of={cell.render()} />
								{:else}
									<Button variant="ghost" on:click={props.sort.toggle}>
										<Render of={cell.render()}></Render>
										{#if props.sort.disabled === false}
											<ArrowUpDown
												class={cn(
													$sortKeys[0]?.id === cell.id && 'text-foreground',
													'ml-2 h-4 w-4'
												)}
											/>
										{/if}
									</Button>
								{/if}
							</Table.Head>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Header>
	<Table.Body {...$tableBodyAttrs}>
		{#each $rows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
					<!-- {JSON.stringify(rows)} -->
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<Table.Cell class="p-2 [&:has([role=checkbox])]:pl-3" {...attrs}>
								{#if cell.id === 'amount'}
									<div class="text-right font-medium">
										<Render of={cell.render()} />
									</div>
								{:else if cell.id === 'status'}
									<div class="capitalize">
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
	</Table.Body>
	<Table.Footer class="sticky bottom-0 bg-muted"
		><Table.Row>
			<Table.Head colspan={100}>
				<div class="flex-1 text-sm text-muted-foreground">
					{Object.keys($selectedDataIds).length} of {$rows.length} row(s) selected. {JSON.stringify(
						$selectedDataIds
					)}
				</div>
			</Table.Head>
		</Table.Row></Table.Footer
	>
</Table.Root>
<!--	<Button 
		variant="outline"
		size="sm"
		on:click={() => ($pageIndex = $pageIndex - 1)}
		disabled={!$hasPreviousPage}>Previous</Button
	>
	<Button
		variant="outline"
		size="sm"
		disabled={!$hasNextPage}
		on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
	> -->
<!-- 
<div class="w-full p-2">
	<Card.Root class="h-full w-full">
		<Card.Content class="flex h-full flex-col p-0">
			<div class="h-16 w-full items-center bg-muted p-2">Footer</div>
			<div class="overflow-x-auto border">
				<DataTable {viewModel} {pluginStates}></DataTable>
			</div>
		</Card.Content>
	</Card.Root>
</div> -->
