<script lang="ts">
	import type { TableViewModel } from 'svelte-headless-table';
	import RadixIconsCross2 from '$lib/icons/RadixIconsCross2.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '../(data)/schemas.js';
	import { DataTableViewErp, DataTableViewOptions } from './index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	export let tableModel: TableViewModel<Product>;
	//	export let data: Product[];

	/* 	const counts = data.reduce<{
		status: { [index: string]: number };
		priority: { [index: string]: number };
	}>(
		(acc, { status, priority }) => {
			acc.status[status] = (acc.status[status] || 0) + 1;
			acc.priority[priority] = (acc.priority[priority] || 0) + 1;
			return acc;
		},
		{
			status: {},
			priority: {}
		}
	); */

	const { pluginStates } = tableModel;
	const {
		filterValue
	}: {
		filterValue: Writable<string>;
	} = pluginStates.filter;

	const {
		filterValues
	}: {
		filterValues: Writable<{
			status: string[];
			priority: string[];
		}>;
	} = pluginStates.colFilter;

	$: showReset = Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0);
</script>

<div class="flex items-center justify-between p-2">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="Filter tasks..."
			class="h-8 w-[150px] lg:w-[250px]"
			type="search"
			bind:value={$filterValue}
		/>

		<!-- 	<DataTableFacetedFilter
			bind:filterValues={$filterValues.status}
			title="Status"
			options={statuses}
			counts={counts.status}
		/>
		<DataTableFacetedFilter
			bind:filterValues={$filterValues.priority}
			title="Priority"
			options={priorities}
			counts={counts.priority}
		/> -->
		{#if showReset}
			<Button
				on:click={() => {
					$filterValue = '';
					$filterValues.status = [];
					$filterValues.priority = [];
				}}
				variant="ghost"
				class="h-8 px-2 lg:px-3"
			>
				Reset
				<RadixIconsCross2 class="ml-2 h-4 w-4" />
			</Button>
		{/if}
	</div>

	<DataTableViewErp {tableModel} />
	<DataTableViewOptions {tableModel} />
</div>
