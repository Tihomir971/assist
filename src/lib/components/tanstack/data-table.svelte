<script lang="ts" generics="TData, TValue">
	import { FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Table as TableCore } from '@tanstack/table-core';
	import PhArrowUp from '~icons/ph/arrow-up';
	import PhArrowDown from '~icons/ph/arrow-down';
	import PhArrowsDownUp from '~icons/ph/arrows-down-up';
	import PhFunnelSimple from '~icons/ph/funnel-simple';
	interface Props {
		table: TableCore<TData>;
	}

	let { table }: Props = $props();
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head colspan={header.colSpan}>
							{#if !header.isPlaceholder}
								<div class="flex">
									<button
										type="button"
										class="flex items-center justify-between"
										class:cursor-pointer={header.column.getCanSort()}
										class:select-none={header.column.getCanSort()}
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
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
									{#if header.column.getCanFilter()}
										{#if header.column.columnDef.meta?.filterType == 'text'}
											<PhFunnelSimple />
										{/if}
									{/if}
								</div>
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
					<Table.Cell colspan={table.getAllColumns.length} class="h-24 text-center"
						>No results.</Table.Cell
					>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
