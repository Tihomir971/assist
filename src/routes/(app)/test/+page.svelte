<script lang="ts">
	import { DataTable } from '$lib/components/datatable';
	import { createTable, Subscribe, Render } from 'svelte-headless-table';
	import { readable } from 'svelte/store';

	//export let data;
	//const { contributions } = data;
	//console.log('contributions', contributions);

	const tableData = readable([
		{ name: 'Ada Lovelace', age: 21 },
		{ name: 'Barbara Liskov', age: 52 },
		{ name: 'Richard Hamming', age: 38 }
	]);

	const table = createTable(tableData);

	const columns = table.createColumns([
		table.column({
			header: 'Name',
			accessor: 'name'
		}),
		table.column({
			header: 'Age',
			accessor: 'age'
		})
	]);

	const { headerRows, rows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);

	async function getPrice() {
		const contributions = await (await fetch('api')).json();

		console.log('contributions', contributions);
	}
</script>

<button on:click={getPrice}>Test</button>
<div class="h-24 w-24 bg-slate-400 shadow-test"></div>
<DataTable {...$tableAttrs}>
	<!-- <table {...$tableAttrs}> -->
	<thead>
		{#each $headerRows as headerRow (headerRow.id)}
			<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
				<tr {...rowAttrs}>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<th {...attrs}>
								<Render of={cell.render()} />
							</th>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</thead>
	<tbody {...$tableBodyAttrs}>
		{#each $rows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<tr {...rowAttrs}>
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<td {...attrs}>
								<Render of={cell.render()} />
							</td>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</tbody>
	<!-- </table> -->
</DataTable>
