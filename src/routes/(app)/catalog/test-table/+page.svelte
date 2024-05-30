<script lang="ts">
	import DataTable from './(components)/data-table.svelte';

	import { writable } from 'svelte/store';

	export let data;
	//	const products = writable(data.products);
	$: products = data.products;
</script>

<!-- <DataTableToolbar {tableModel} {data} /> -->
<DataTable bind:data={products} />
<!-- 	<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										{#if cell.id !== 'select' && cell.id !== 'actions'}
											<DataTableColumnHeader {props} {tableModel} cellId={cell.id}>
												<Render of={cell.render()} /></DataTableColumnHeader
											>
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
										<Table.Cell {...attrs}>
											{#if cell.id === 'sku'}
												<div class="w-[40px]">
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
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root> -->
