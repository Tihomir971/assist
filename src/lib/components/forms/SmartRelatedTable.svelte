<script lang="ts">
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AnyZodObject, z } from 'zod';
	import type { RelatedTableConfig } from '$lib/types/related-table-config.types';

	// UI Components
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { CheckboxZag } from '$lib/components/zag';

	// Icons
	import PhDotsThreeBold from '~icons/ph/dots-three-bold';
	import PhPlus from '~icons/ph/plus';
	import PhMagnifyingGlass from '~icons/ph/magnifying-glass';
	import PhCaretUp from '~icons/ph/caret-up';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhDownload from '~icons/ph/download';

	// Related Drawer
	import SmartRelatedDrawer from './SmartRelatedDrawer.svelte';
	import UrlCell from './cells/UrlCell.svelte';

	interface SmartRelatedTableProps<T extends Record<string, any>, S extends AnyZodObject> {
		config: RelatedTableConfig<T, S>;
		items: T[];
		validatedForm: SuperValidated<z.infer<S>>;
		parentId: number | undefined;
		lookupData?: Record<string, Array<{ value: any; label: string }>>;
		onRefresh?: () => void;
		onBulkAction?: (action: string, selectedIds: number[]) => void;
	}

	let {
		config,
		items: initialItems,
		validatedForm,
		parentId,
		lookupData = {},
		onRefresh,
		onBulkAction
	}: SmartRelatedTableProps<any, any> = $props();

	// Internal reactive data that updates automatically
	let items = $state(initialItems);

	// Update items when initialItems changes (from parent)
	$effect(() => {
		items = initialItems;
	});

	// The `tableConfig` is an alias for the `config` prop.
	// The lookup logic is now handled directly and explicitly in `formatCellValue`.
	const tableConfig = config;

	// State management
	let isDrawerOpen = $state(false);
	let selectedItemId: number | undefined = $state();
	let searchQuery = $state('');
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let selectedItems = $state<Set<number>>(new Set());
	let currentPage = $state(1);

	// Derived state
	let selectedItem = $derived.by(() => {
		return items?.find((item: any) => item.id === selectedItemId);
	});

	let filteredItems = $derived.by(() => {
		if (!searchQuery) return items;

		return items.filter((item: any) => {
			return tableConfig.columns.some((column) => {
				if (!column.searchable) return false;
				const value = item[column.key];
				return String(value).toLowerCase().includes(searchQuery.toLowerCase());
			});
		});
	});

	let sortedItems = $derived.by(() => {
		if (!sortColumn) return filteredItems;

		return [...filteredItems].sort((a: any, b: any) => {
			const aVal = a[sortColumn as string];
			const bVal = b[sortColumn as string];

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	});

	let paginatedItems = $derived.by(() => {
		if (!tableConfig.itemsPerPage) return sortedItems;

		const startIndex = (currentPage - 1) * tableConfig.itemsPerPage;
		const endIndex = startIndex + tableConfig.itemsPerPage;
		return sortedItems.slice(startIndex, endIndex);
	});

	let totalPages = $derived(
		tableConfig.itemsPerPage ? Math.ceil(sortedItems.length / tableConfig.itemsPerPage) : 1
	);

	let allSelected = $derived(
		paginatedItems.length > 0 && paginatedItems.every((item: any) => selectedItems.has(item.id))
	);

	let someSelected = $derived(paginatedItems.some((item: any) => selectedItems.has(item.id)));

	// Event handlers
	function handleAdd() {
		selectedItemId = undefined;
		isDrawerOpen = true;
	}

	function handleEdit(itemId: number) {
		selectedItemId = itemId;
		isDrawerOpen = true;
	}

	function handleSort(columnKey: string) {
		if (!tableConfig.sortable) return;

		if (sortColumn === columnKey) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = columnKey;
			sortDirection = 'asc';
		}
	}

	function handleDrawerClose() {
		isDrawerOpen = false;
		selectedItemId = undefined;
	}

	function handleSave(result?: any) {
		// Reset selected item after save
		selectedItemId = undefined;

		// Always refresh data from parent to ensure consistency
		onRefresh?.();
	}

	function handleSelectAll() {
		if (allSelected) {
			selectedItems.clear();
		} else {
			paginatedItems.forEach((item: any) => selectedItems.add(item.id));
		}
		selectedItems = selectedItems; // Trigger reactivity
	}

	function handleSelectItem(itemId: number) {
		if (selectedItems.has(itemId)) {
			selectedItems.delete(itemId);
		} else {
			selectedItems.add(itemId);
		}
		selectedItems = selectedItems; // Trigger reactivity
	}

	function handleBulkAction(action: string) {
		if (selectedItems.size === 0) return;
		onBulkAction?.(action, Array.from(selectedItems));
		selectedItems.clear();
		selectedItems = selectedItems; // Trigger reactivity
	}

	function handleExport() {
		// Simple CSV export
		const headers = tableConfig.columns.map((col) => col.label).join(',');
		const rows = sortedItems
			.map((item: any) =>
				tableConfig.columns.map((col) => formatCellValue(item[col.key], col, item)).join(',')
			)
			.join('\n');

		const csv = `${headers}\n${rows}`;
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${tableConfig.title.toLowerCase().replace(/\s+/g, '-')}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Cell value formatter
	function formatCellValue(value: any, column: any, row: any) {
		if (column.formatter) {
			return column.formatter(value, row);
		}

		switch (column.type) {
			case 'boolean':
				return value ? 'Yes' : 'No';
			case 'date':
				return value ? new Date(value).toLocaleDateString() : '';
			case 'datetime':
				return value ? new Date(value).toLocaleString() : '';
			case 'lookup':
				// Use the explicit lookupKey to find the correct dataset.
				if (column.lookupKey && lookupData[column.lookupKey]) {
					return (
						lookupData[column.lookupKey].find((item: any) => item.value === value)?.label || value
					);
				}
				// Fallback to the raw value if no lookup is found.
				return value;
			default:
				return value || '';
		}
	}
</script>

<Card.Root class={tableConfig.cardProps?.className || 'col-span-2'}>
	{#if tableConfig.cardProps?.showHeader !== false}
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>{tableConfig.title}</Card.Title>
					{#if tableConfig.description}
						<Card.Description>{tableConfig.description}</Card.Description>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					{#if tableConfig.searchable}
						<div class="relative">
							<PhMagnifyingGlass class="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
							<Input placeholder="Search..." bind:value={searchQuery} class="w-64 pl-8" />
						</div>
					{/if}

					{#if tableConfig.exportEnabled}
						<Button variant="outline" size="sm" onclick={handleExport}>
							<PhDownload class="mr-2 h-4 w-4" />
							Export
						</Button>
					{/if}

					{#if tableConfig.canCreate}
						<Button variant="outline" size="sm" onclick={handleAdd}>
							<PhPlus class="mr-2 h-4 w-4" />
							Add
						</Button>
					{/if}
				</div>
			</div>

			<!-- Bulk Actions -->
			{#if tableConfig.bulkOperations?.enabled && selectedItems.size > 0}
				<div class="flex items-center gap-2 border-t pt-2">
					<span class="text-sm text-muted-foreground">
						{selectedItems.size} item{selectedItems.size === 1 ? '' : 's'} selected
					</span>
					{#each tableConfig.bulkOperations.actions as action}
						<Button
							variant={action.variant || 'outline'}
							size="sm"
							onclick={() => handleBulkAction(action.action)}
						>
							{#if action.icon}
								<!-- Icon rendering will be implemented in Phase 3 -->
							{/if}
							{action.label}
						</Button>
					{/each}
				</div>
			{/if}
		</Card.Header>
	{/if}

	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#if tableConfig.bulkOperations?.enabled}
						<Table.Head class="w-8">
							<Checkbox
								checked={allSelected}
								indeterminate={someSelected && !allSelected}
								onCheckedChange={handleSelectAll}
							/>
						</Table.Head>
					{/if}

					{#each tableConfig.columns as column}
						<Table.Head
							class={`${column.width ? `w-[${column.width}]` : ''} ${tableConfig.sortable && column.sortable !== false ? 'cursor-pointer' : ''}`}
							onclick={() => {
								if (tableConfig.sortable && column.sortable !== false) {
									handleSort(String(column.key));
								}
							}}
						>
							<div class="flex items-center gap-1">
								{column.label}
								{#if tableConfig.sortable && column.sortable !== false}
									{#if sortColumn === String(column.key)}
										{#if sortDirection === 'asc'}
											<PhCaretUp class="h-4 w-4" />
										{:else}
											<PhCaretDown class="h-4 w-4" />
										{/if}
									{/if}
								{/if}
							</div>
						</Table.Head>
					{/each}

					{#if tableConfig.canEdit || tableConfig.canDelete}
						<Table.Head class="w-8"></Table.Head>
					{/if}
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#each paginatedItems as row (row.id)}
					<Table.Row>
						{#if tableConfig.bulkOperations?.enabled}
							<Table.Cell>
								<Checkbox
									checked={selectedItems.has(row.id)}
									onCheckedChange={() => handleSelectItem(row.id)}
								/>
							</Table.Cell>
						{/if}

						{#each tableConfig.columns as column}
							<Table.Cell class={column.key === tableConfig.columns[0]?.key ? 'font-medium' : ''}>
								{#if column.type === 'boolean'}
									<CheckboxZag checked={row[column.key]} disabled />
								{:else if column.type === 'url'}
									<UrlCell value={row[column.key]} />
								{:else if column.component}
									<!-- Custom component rendering will be implemented in Phase 3 -->
									{formatCellValue(row[column.key], column, row)}
								{:else}
									{formatCellValue(row[column.key], column, row)}
								{/if}
							</Table.Cell>
						{/each}

						{#if tableConfig.canEdit || tableConfig.canDelete}
							<Table.Cell>
								<Button variant="ghost" size="icon" onclick={() => handleEdit(row.id)}>
									<PhDotsThreeBold class="h-4 w-4" />
								</Button>
							</Table.Cell>
						{/if}
					</Table.Row>
				{/each}

				{#if paginatedItems.length === 0}
					<Table.Row>
						<Table.Cell
							colspan={tableConfig.columns.length +
								(tableConfig.canEdit || tableConfig.canDelete ? 1 : 0) +
								(tableConfig.bulkOperations?.enabled ? 1 : 0)}
							class="py-8 text-center text-muted-foreground"
						>
							{searchQuery ? 'No items match your search' : 'No items found'}
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>

		<!-- Pagination -->
		{#if tableConfig.itemsPerPage && totalPages > 1}
			<div class="flex items-center justify-between pt-4">
				<div class="text-sm text-muted-foreground">
					Showing {(currentPage - 1) * tableConfig.itemsPerPage + 1} to {Math.min(
						currentPage * tableConfig.itemsPerPage,
						sortedItems.length
					)} of {sortedItems.length} items
				</div>

				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === 1}
						onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					>
						Previous
					</Button>

					<span class="text-sm">
						Page {currentPage} of {totalPages}
					</span>

					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					>
						Next
					</Button>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<!-- Smart Related Drawer -->
<SmartRelatedDrawer
	bind:isOpen={isDrawerOpen}
	config={tableConfig}
	item={selectedItem}
	{validatedForm}
	{parentId}
	{lookupData}
	onClose={handleDrawerClose}
	onSave={handleSave}
/>
