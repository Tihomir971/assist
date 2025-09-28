<script lang="ts" generics="TData">
	import XIcon from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import { DataTableFacetedFilter, DataTableViewOptions } from './index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { FacetedFilter } from './types.js';
	import SearchIcon from '@lucide/svelte/icons/search';

	let {
		table,
		searchColumn = 'name',
		facetedFilters = [],
		placeholder = 'Filter...'
	}: {
		table: Table<TData>;
		searchColumn?: string;
		facetedFilters?: FacetedFilter[];
		placeholder?: string;
	} = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const searchCol = $derived(table.getColumn(searchColumn));
	const facetedColumns = $derived(
		facetedFilters
			.map((filter) => {
				const column = table.getColumn(filter.column);
				return column
					? {
							column,
							title: filter.title,
							options: filter.options
						}
					: null;
			})
			.filter(
				(
					item
				): item is {
					column: NonNullable<ReturnType<typeof table.getColumn>>;
					title: string;
					options: Array<{ label: string; value: string; icon?: any }>;
				} => item !== null
			)
	);
</script>

<div class="flex items-center justify-between p-1">
	<div class="flex flex-1 items-center space-x-2">
		<div class="relative">
			<Input
				{placeholder}
				value={(searchCol?.getFilterValue() as string) ?? ''}
				oninput={(e) => {
					searchCol?.setFilterValue(e.currentTarget.value);
				}}
				onchange={(e) => {
					searchCol?.setFilterValue(e.currentTarget.value);
				}}
				class="h-8 w-[150px] pl-8 lg:w-[250px]"
			/>
			<SearchIcon
				class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none"
			/>
		</div>

		{#each facetedColumns as facetedColumn (facetedColumn.column.id)}
			<DataTableFacetedFilter
				column={facetedColumn.column}
				title={facetedColumn.title}
				options={facetedColumn.options}
			/>
		{/each}

		{#if isFiltered}
			<Button variant="ghost" onclick={() => table.resetColumnFilters()} class="h-8 px-2 lg:px-3">
				Reset
				<XIcon />
			</Button>
		{/if}
	</div>
	<DataTableViewOptions {table} />
</div>
