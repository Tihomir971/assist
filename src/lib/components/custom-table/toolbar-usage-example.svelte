<!-- Example of how to use the reusable DataTableToolbar component -->

<script lang="ts">
	import DataTableToolbar from './data-table-toolbar.svelte';
	import type { Table } from '@tanstack/table-core';

	// Example filter options - you can load these from your data or API
	const statusOptions = [
		{ label: 'Active', value: 'active' },
		{ label: 'Inactive', value: 'inactive' },
		{ label: 'Pending', value: 'pending' }
	];

	const priorityOptions = [
		{ label: 'High', value: 'high' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'Low', value: 'low' }
	];

	const categoryOptions = [
		{ label: 'Electronics', value: 'electronics' },
		{ label: 'Clothing', value: 'clothing' },
		{ label: 'Books', value: 'books' }
	];

	// Configure the toolbar with your specific filters
	const toolbarConfig = {
		searchColumn: 'name', // The column to search in
		placeholder: 'Search products...', // Custom placeholder text
		facetedFilters: [
			{
				column: 'status',
				title: 'Status',
				options: statusOptions
			},
			{
				column: 'priority',
				title: 'Priority',
				options: priorityOptions
			},
			{
				column: 'category',
				title: 'Category',
				options: categoryOptions
			}
		]
	};

	// In your component, use it like this:
	let { table }: { table: Table<any> } = $props();
</script>

<!-- Usage in your template -->
<DataTableToolbar
	{table}
	searchColumn={toolbarConfig.searchColumn}
	placeholder={toolbarConfig.placeholder}
	facetedFilters={toolbarConfig.facetedFilters}
/>

<!-- Alternative: Use all default values -->
<!-- <DataTableToolbar {table} /> -->

<!-- Alternative: Only override some values -->
<!-- <DataTableToolbar {table} placeholder="Search items..." /> -->
