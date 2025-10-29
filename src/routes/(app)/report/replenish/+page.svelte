<script lang="ts">
	import { useDataTable } from '$lib/components/tanstack/useDataTable.svelte.js';
	import type { ColumnDef } from '@tanstack/table-core';

	import { columnDefs } from './table-columns.svelte.js';
	import DataTable from '$lib/components/tanstack/data-table.svelte';
	import type { TableRow } from './table-types.js';

	let { data } = $props();

	const { table } = $derived(
		useDataTable({
			columns: columnDefs as ColumnDef<TableRow>[],
			data: data.products,
			getRowId: (row) => row.id.toString()
		})
	);
</script>

<DataTable {table} />
