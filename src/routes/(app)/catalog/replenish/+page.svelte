<script lang="ts">
	import DataTable from '$lib/blocks/DataTable.svelte';
	import { readable, writable } from 'svelte/store';
	import type { PageData } from './$types';
	import { createRender, createTable } from 'svelte-headless-table';
	import { goto } from '$app/navigation';
	import TableAction from '../TableAction.svelte';

	export let data: PageData;
	const tableData = writable(data.products);
	$: $tableData = data.products;
	//	$: products = readable(data.products);
	//$: $products = data.products;

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

	function getReplenish(
		warehouse_id: number,
		productStorage: {
			m_warehouse_id: number;
			level_min: number;
		}[]
	): number {
		const item = productStorage.find((item) => item.m_warehouse_id === warehouse_id);
		return item ? item.level_min : 0;
	}

	const table = createTable(tableData);

	const columns = table.createColumns([
		table.column({
			header: 'SKU',
			accessor: 'sku'
		}),
		table.column({
			header: 'Barcode',
			accessor: 'barcode'
		}),
		table.column({
			header: 'Name',
			accessor: 'name'
		}),
		table.column({
			id: 'wholesale',
			header: 'Stock',
			accessor: (item) => getQtyOnHand(5, item.m_storageonhand)
		}),
		table.column({
			id: 'level_min',
			header: 'Min',
			accessor: (item) => {
				const data = item.level_min.find((item) => item.m_warehouse_id === 5);
				return data?.level_min ?? 0;
			}
		}),
		table.column({
			id: 'level_max',
			header: 'Max',
			accessor: (item) => {
				const data = item.level_max.find((item) => item.m_warehouse_id === 5);
				return data?.level_max ?? 0;
			}
		}),
		table.column({
			id: 'unitsperpack',
			header: 'Pack.',
			accessor: 'unitsperpack'
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

	const viewModel = table.createViewModel(columns);
</script>

<div class="flex flex-col">
	<div>Toolbar</div>
	<DataTable {viewModel}></DataTable>
</div>
