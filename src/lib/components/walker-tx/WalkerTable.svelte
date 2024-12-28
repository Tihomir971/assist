<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import PhArrowUp from '~icons/ph/arrow-up';
	import PhArrowDown from '~icons/ph/arrow-down';
	import PhArrowsDownUp from '~icons/ph/arrows-down-up';
	import FlexRender from './flex-render.svelte';

	let { table } = $props();
</script>

<Table.Root class="table-auto">
	<Table.Header class="bg-well-2 sticky top-0 z-10">
		<Table.Row>
			{#each table.getHeaderGroups() as headerGroup}
				{#each headerGroup.headers as header}
					<Table.Head>
						<button
							type="button"
							class="flex items-center justify-between"
							class:cursor-pointer={header.column.getCanSort()}
							class:select-none={header.column.getCanSort()}
							onclick={header.column.getToggleSortingHandler()}
						>
							<FlexRender content={header.column.columnDef.header} context={header.getContext()} />

							{#if header.column.getCanSort()}
								<span class="ml-1">
									{#if header.column.getIsSorted() === 'asc'}
										<PhArrowUp style="color: white" />
									{:else if header.column.getIsSorted() === 'desc'}
										<PhArrowDown style="color: white" />
									{:else}
										<PhArrowsDownUp />
									{/if}
								</span>
							{/if}
						</button>
					</Table.Head>
				{/each}
			{/each}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each table.getRowModel().rows as row (row.id)}
			<Table.Row data-state={row.getIsSelected() && 'selected'}>
				{#each row.getVisibleCells() as cell (cell.id)}
					<Table.Cell class="py-2">
						<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
					</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
	</Table.Body>
	<Table.Footer class="bg-well-2 text-muted-foreground sticky bottom-0 z-10">
		<Table.Row>
			<Table.Cell colspan={table.getVisibleFlatColumns().length} class="h-12 py-0 text-center">
				{table.getSelectedRowModel().rows.length} of {table.getRowCount()}
				row(s) selected.
			</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>
