<script lang="ts" generics="TData">
	import {
		createSvelteTable,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		getPaginationRowModel,
		type SortingState,
		type VisibilityState,
		type Updater,
		type ColumnFiltersState,
		type PaginationState
	} from '$lib/components/walker-tx';
	import PhArrowUp from '~icons/ph/arrow-up';
	import PhArrowDown from '~icons/ph/arrow-down';
	import PhArrowsDownUp from '~icons/ph/arrows-down-up';
	import FlexRender from '$lib/components/walker-tx/flex-render.svelte'; // Keep for now
	import SmartTableToolbar from './SmartTableToolbar.svelte';
	import SmartTablePagination from './SmartTablePagination.svelte';
	import type { DataTableConfig, SelectFilterOption } from '$lib/utils/data-table-config.builder';
	import { page as pageStore } from '$app/state'; // Renamed to avoid conflict with prop
	import { goto } from '$app/navigation';
	import { invalidate } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms/client';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';

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
	let pagination = $state<PaginationState>({
		pageIndex: config.mode === 'client' ? 0 : page - 1,
		pageSize: config.mode === 'client' ? data.length : perPage
	});
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
				// Reload data to reflect changes
				invalidate('crm:contacts');
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
		getPaginationRowModel: config.mode === 'client' ? undefined : getPaginationRowModel(),
		globalFilterFn: 'includesString',
		onSortingChange: (updater: Updater<SortingState>) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
			if (config.mode === 'server') {
				const params = new URLSearchParams(pageStore.url.searchParams);
				if (sorting.length > 0) {
					params.set('sort', sorting[0].id);
					params.set('order', sorting[0].desc ? 'desc' : 'asc');
				} else {
					params.delete('sort');
					params.delete('order');
				}
				params.set('page', '1');
				goto(`?${params.toString()}`, { replaceState: true });
			}
		},
		onColumnVisibilityChange: (updater: Updater<VisibilityState>) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
		},
		onGlobalFilterChange: (updater: Updater<string>) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
			// Global filter changes are now handled by the toolbar component
		},
		onRowSelectionChange: (updater: Updater<Record<string, boolean>>) => {
			rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
		},
		onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
			// We no longer apply server filters automatically on column filter change.
			// This will be handled by a button in the toolbar.
		},
		onPaginationChange: (updater: Updater<PaginationState>) => {
			if (config.mode === 'client') {
				pagination = typeof updater === 'function' ? updater(pagination) : updater;
			}
			// For server mode, pagination is handled by handlePageChange/handlePerPageChange
		},
		state: {
			get sorting() {
				return sorting;
			},
			get pagination() {
				if (config.mode === 'server') {
					return { pageIndex: page - 1, pageSize: perPage };
				}
				return pagination;
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

	// Handle pagination changes for server mode
	function handlePageChange(newPage: number) {
		if (config.mode === 'server') {
			const params = new URLSearchParams(pageStore.url.searchParams);
			params.set('page', newPage.toString());
			goto(`?${params.toString()}`, { replaceState: true });
		} else {
			table.setPageIndex(newPage - 1);
		}
	}

	function handlePerPageChange(newPerPage: number) {
		if (config.mode === 'server') {
			const params = new URLSearchParams(pageStore.url.searchParams);
			params.set('perPage', newPerPage.toString());
			params.set('page', '1'); // Reset to first page
			goto(`?${params.toString()}`, { replaceState: true });
		} else {
			table.setPageSize(newPerPage);
		}
	}

	// Expose delete dialog functionality to toolbar
	function openDeleteDialog(id: number) {
		$deleteSuperForm.id = id;
		deleteDialogOpen = true;
	}
</script>

<div class="container mx-auto py-6">
	<Card.Root>
		<Card.Header>
			<SmartTableToolbar
				{table}
				{config}
				bind:globalFilter
				{lookupData}
				onOpenDeleteDialog={openDeleteDialog}
			/>
		</Card.Header>
		<Card.Content>
			<div class="rounded-md border">
				<div class="max-h-[750px] overflow-y-auto">
					<table class="w-full caption-bottom text-sm">
						<thead class="[&_tr]:border-b">
							{#each table.getHeaderGroups() as headerGroup}
								<tr>
									{#each headerGroup.headers as header}
										<th
											colspan={header.colSpan}
											class={`sticky top-0 z-30 border-b bg-background px-4 py-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${header.column.columnDef.meta?.className || ''}`}
										>
											{#if !header.isPlaceholder}
												<button
													type="button"
													class="flex w-full items-center gap-2"
													class:cursor-pointer={header.column.getCanSort()}
													class:justify-center={header.column.columnDef.meta?.className?.includes(
														'text-center'
													)}
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
										</th>
									{/each}
								</tr>
							{/each}
						</thead>
						<tbody class="[&_tr:last-child]:border-0">
							{#if table.getRowModel().rows?.length}
								{#each table.getRowModel().rows as row}
									<tr
										data-state={row.getIsSelected() && 'selected'}
										class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									>
										{#each row.getVisibleCells() as cell}
											<td
												class={`p-2 align-middle [&:has([role=checkbox])]:pr-0 ${cell.column.columnDef.meta?.className || ''}`}
											>
												{#if cell.column.columnDef.meta?.cellWrapperClass}
													<div class={cell.column.columnDef.meta.cellWrapperClass}>
														<FlexRender
															content={cell.column.columnDef.cell}
															context={cell.getContext()}
														/>
													</div>
												{:else}
													<FlexRender
														content={cell.column.columnDef.cell}
														context={cell.getContext()}
													/>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan={config.columns.length} class="h-24 text-center"> No results. </td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	{#if config.mode === 'server'}
		<SmartTablePagination
			{table}
			{count}
			{page}
			{perPage}
			onPageChange={handlePageChange}
			onPerPageChange={handlePerPageChange}
		/>
	{/if}
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
