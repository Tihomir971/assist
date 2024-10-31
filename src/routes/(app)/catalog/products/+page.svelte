<script lang="ts">
	import {
		createColumnHelper,
		createSvelteTable,
		FlexRender,
		getCoreRowModel,
		renderComponent,
		renderSnippet,
		type RowSelectionState,
		type Updater
	} from '$lib/components/walker-tx';
	import TableCheckbox from '$lib/components/walker-tx/table-checkbox.svelte';
	import { createRawSnippet } from 'svelte';
	import * as Table from '$lib/components/ui/table';

	import { columnDefs, type FlattenedProduct } from './columns.js';
	import { formatNumber } from '$lib/style/locale.js';

	let { data } = $props();

	const rightAlignSnippet = createRawSnippet<[string]>((getValue) => {
		const value = getValue() ?? 0;
		return {
			render: () => `<div class="text-right">${value}</div>`
		};
	});

	// Define a reactive state to track the row selection state.
	let rowSelectionState: RowSelectionState = $state({});
	function onRowSelectionChange(updater: Updater<RowSelectionState>) {
		// Update the selection state by reassigning the $state
		if (updater instanceof Function) {
			rowSelectionState = updater(rowSelectionState);
		} else {
			rowSelectionState = updater;
		}
	}
	// Create the table and bind the row selection state using a getter.
	const table = createSvelteTable({
		get data() {
			return data.products;
		},
		columns: columnDefs,
		state: {
			get rowSelection() {
				return rowSelectionState;
			}
		},
		onRowSelectionChange: onRowSelectionChange,
		getCoreRowModel: getCoreRowModel()
	});
</script>

<!-- <div class="w-full">
	{JSON.stringify(selectedRows)}
	<DataTable data={data.products} {columnsDefs} bind:selectedRows />
</div> -->
<div class="w-full">
	<div>
		<h2>Actions</h2>
		<hr />
		<button onclick={() => table.toggleAllRowsSelected()}>
			{#if table.getIsAllRowsSelected()}
				Deselect All
			{:else}
				Select All
			{/if}
		</button>
	</div>
	<hr />
	<div class="w-full overflow-auto">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each table.getHeaderGroups() as headerGroup}
						{#each headerGroup.headers as header}
							<Table.Head>
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							</Table.Head>
						{/each}
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
