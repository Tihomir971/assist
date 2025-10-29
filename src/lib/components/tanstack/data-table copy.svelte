<script lang="ts" generics="TData, TValue">
	import { type ColumnDef } from '@tanstack/table-core';
	import { FlexRender } from '$lib/components/ui/data-table/index.js';
	import { useDataTable } from '$lib/components/tanstack/useDataTable.svelte';
	import * as Table from '$lib/components/ui/table/index.js';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		getRowId?: (row: TData) => string;
	};

	let { data, columns, getRowId }: DataTableProps<TData, TValue> = $props();

	const { table } = useDataTable({
		columns: columns as ColumnDef<TData>[],
		data,
		getRowId:
			getRowId ||
			((row: TData) => {
				const record = row as Record<string, unknown>;
				return (record.id as string)?.toString() || JSON.stringify(row);
			})
	});
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head colspan={header.colSpan}>
							{#if !header.isPlaceholder}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
