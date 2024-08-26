<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { Subscribe, Render, type TableViewModel } from 'svelte-headless-table';
	import type { AnyPlugins, PluginStates } from 'svelte-headless-table/plugins';
	/* 	type $$Props = HTMLTableAttributes;

	let className: $$Props["class"] = undefined;
	export { className as class }; */

	export let viewModel: TableViewModel<any, AnyPlugins>;
	export let pluginStates: PluginStates<AnyPlugins>;
	const { headerRows, rows, tableAttrs, tableBodyAttrs } = viewModel;
	let { selectedDataIds } = pluginStates.select;
</script>

<table {...$tableAttrs} class={cn('relative table w-full border-collapse overflow-auto  text-sm')}>
	<thead
		class="sticky top-0 z-50 h-12 bg-muted px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
	>
		{#each $headerRows as headerRow (headerRow.id)}
			<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
				<tr {...rowAttrs} class={cn('transition-colors data-[state=selected]:bg-muted')}>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<th
								{...attrs}
								class={cn(
									'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'
								)}
							>
								<Render of={cell.render()} />
							</th>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</thead>
	<tbody {...$tableBodyAttrs} class={cn('h-96 overflow-auto [&_tr:last-child]:border-0')}>
		{#each $rows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<tr
					{...rowAttrs}
					class={cn(
						'h-11 border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
					)}
				>
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<td {...attrs} class={cn('px-3 align-middle [&:has([role=checkbox])]:pr-0')}>
								<Render of={cell.render()} />
							</td>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</tbody>
	<tfoot class="sticky bottom-0"
		><tr class="h-12 bg-muted">
			<th scope="row" colspan="100">{JSON.stringify(selectedDataIds)}</th>
		</tr></tfoot
	>
</table>
