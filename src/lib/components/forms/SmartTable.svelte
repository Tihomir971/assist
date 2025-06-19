<script lang="ts" generics="TData">
	import {
		createSvelteTable,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		getPaginationRowModel,
		type Table as TanstackTable,
		type ColumnDef,
		type SortingState,
		type VisibilityState,
		type Updater,
		type ColumnFiltersState
	} from '$lib/components/walker-tx';
	import * as Table from '$lib/components/ui/table';
	import PhArrowUp from '~icons/ph/arrow-up';
	import PhArrowDown from '~icons/ph/arrow-down';
	import PhArrowsDownUp from '~icons/ph/arrows-down-up';
	import FlexRender from '$lib/components/walker-tx/flex-render.svelte'; // Keep for now
	import SmartTableToolbar from './SmartTableToolbar.svelte';
	import SmartTablePagination from './SmartTablePagination.svelte';
	import type { DataTableConfig, SelectFilterOption } from '$lib/utils/data-table-config.builder';
	import { page as pageStore } from '$app/state'; // Renamed to avoid conflict with prop
	import { superForm } from 'sveltekit-superforms/client';
	import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	type Props = {
		data: TData[];
		config: DataTableConfig<TData>;
		count: number;
		page: number; // Current page number (1-based)
		perPage: number; // Items per page
		deleteForm: any; // SuperForm<z.ZodSchema>; // TODO: Type this properly
		lookupData?: Record<string, SelectFilterOption[]>;
	};

	let { data, config, count, page, perPage, deleteForm, lookupData }: Props = $props();

	// TanStack Table State
	let sorting = $state<SortingState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let globalFilter = $state<string>('');
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state({});

	// Delete Dialog State
	let deleteDialogOpen = $state(false);
	const { form: deleteSuperForm, enhance: deleteEnhance } = superForm(deleteForm, {
		resetForm: true,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				deleteDialogOpen = false;
				// Reload page to reflect changes
				window.location.reload();
			}
		}
	});

	// Table Instance
	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns: config.columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: config.mode === 'client' ? getFilteredRowModel() : undefined,
		getSortedRowModel: config.mode === 'client' ? getSortedRowModel() : undefined,
		getPaginationRowModel: config.mode === 'client' ? getPaginationRowModel() : undefined,
		globalFilterFn: 'includesString',
		onSortingChange: (updater: Updater<SortingState>) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
			if (config.mode === 'server') {
				applyServerFilters();
			}
		},
		onColumnVisibilityChange: (updater: Updater<VisibilityState>) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
		},
		onGlobalFilterChange: (updater: Updater<string>) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
			if (config.mode === 'server') {
				applyServerFilters();
			}
		},
		onRowSelectionChange: (updater: Updater<Record<string, boolean>>) => {
			rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
		},
		onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
			if (config.mode === 'server') {
				applyServerFilters();
			}
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get globalFilter() {
				return globalFilter;
			},
			get columnFilters() {
				return columnFilters;
			},
			get rowSelection() {
				return rowSelection;
			},
			pagination: {
				pageIndex: page - 1,
				pageSize: perPage
			}
		},
		manualFiltering: config.mode === 'server',
		manualSorting: config.mode === 'server',
		manualPagination: config.mode === 'server',
		pageCount: config.mode === 'server' ? Math.ceil(count / perPage) : undefined,
		getRowId: (originalRow: TData) =>
			(originalRow as any).id?.toString() || Math.random().toString() // Fallback for rows without 'id'
	});

	// Debug: Log available columns

	// Server-side filtering/sorting/pagination logic
	function applyServerFilters() {
		if (config.mode === 'server') {
			const params = new URLSearchParams(pageStore.url.searchParams); // Use pageStore

			// Apply global filter
			if (globalFilter) {
				params.set('globalFilter', globalFilter);
			} else {
				params.delete('globalFilter');
			}

			// Apply sorting
			if (sorting.length > 0) {
				params.set('sort', sorting[0].id);
				params.set('order', sorting[0].desc ? 'desc' : 'asc');
			} else {
				params.delete('sort');
				params.delete('order');
			}

			// Reset page to 1 when filters or sort change
			params.set('page', '1');

			window.location.href = `?${params.toString()}`;
		}
	}

	// Handle pagination changes for server mode
	function handlePageChange(newPage: number) {
		if (config.mode === 'server') {
			const params = new URLSearchParams(pageStore.url.searchParams); // Use pageStore
			params.set('page', newPage.toString());
			window.location.href = `?${params.toString()}`;
		} else {
			table.setPageIndex(newPage - 1);
		}
	}

	function handlePerPageChange(newPerPage: number) {
		if (config.mode === 'server') {
			const params = new URLSearchParams(pageStore.url.searchParams); // Use pageStore
			params.set('perPage', newPerPage.toString());
			params.set('page', '1'); // Reset to first page
			window.location.href = `?${params.toString()}`;
		} else {
			table.setPageSize(newPerPage);
		}
	}

	// Expose delete dialog functionality to toolbar
	function openDeleteDialog(id: number) {
		$deleteSuperForm.id = id;
		deleteDialogOpen = true;
	}

	function handleColumnFilterChange(id: string, value: unknown) {
		// Update TanStack Table column filters
		const newFilters = columnFilters.filter((f) => f.id !== id);
		if (value !== '' && value !== null && value !== undefined) {
			newFilters.push({ id, value });
		}
		columnFilters = newFilters;

		// Also directly set the column filter for immediate effect
		const column = table.getColumn(id);
		if (column) {
			column.setFilterValue(value);
		}
	}
</script>

<div class="container mx-auto py-6">
	<SmartTableToolbar
		{table}
		{config}
		bind:globalFilter
		{lookupData}
		onApplyFilters={applyServerFilters}
		onOpenDeleteDialog={openDeleteDialog}
		onColumnFilterChange={handleColumnFilterChange}
	/>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row>
						{#each headerGroup.headers as header}
							<Table.Head colspan={header.colSpan}>
								{#if !header.isPlaceholder}
									<button
										type="button"
										class="flex w-full items-center gap-2"
										class:cursor-pointer={header.column.getCanSort()}
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
										{#if header.column.getCanSort()}
											<span class="ml-1">
												{#if header.column.getIsSorted() === 'asc'}
													<PhArrowUp class="h-4 w-4" />
												{:else if header.column.getIsSorted() === 'desc'}
													<PhArrowDown class="h-4 w-4" />
												{:else}
													<PhArrowsDownUp class="h-4 w-4 text-muted-foreground/50" />
												{/if}
											</span>
										{/if}
									</button>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#if table.getFilteredRowModel().rows?.length}
					{#each table.getFilteredRowModel().rows as row}
						<Table.Row data-state={row.getIsSelected() && 'selected'}>
							{#each row.getVisibleCells() as cell}
								<Table.Cell>
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell colspan={config.columns.length} class="h-24 text-center">
							No results.
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<SmartTablePagination
		{table}
		{count}
		{page}
		{perPage}
		onPageChange={handlePageChange}
		onPerPageChange={handlePerPageChange}
	/>
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Deletion</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this item? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action={config.deleteAction} use:deleteEnhance>
			<input type="hidden" name="id" value={$deleteSuperForm.id} />

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (deleteDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="destructive">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
