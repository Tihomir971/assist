import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type GlobalFilterTableState,
	type RowSelectionState,
	type SortingState,
	type VisibilityState,
	type RowData,
	type FilterFnOption
} from '@tanstack/table-core';
import { createSvelteTable } from '$lib/components/ui/data-table/index.js';

export interface DataTableOptions<TData extends RowData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	getRowId?: (originalRow: TData) => string;
	globalFilterFn?: FilterFnOption<TData>;
	initialRowSelection?: RowSelectionState;
	initialSorting?: SortingState;
	initialColumnVisibility?: VisibilityState;
	initialGlobalFilter?: GlobalFilterTableState;
	onColumnVisibilityChange?: (visibility: VisibilityState) => void;
}

export interface DataTableReturn<TData extends RowData> {
	table: ReturnType<typeof createSvelteTable<TData>>;
	// globalFilterTableState: GlobalFilterTableState | undefined;
	// rowSelectionState: RowSelectionState;
	// sortingState: SortingState;
	// visibilityState: VisibilityState;
}

/**
 * A composable function that creates a reactive TanStack table with common functionality.
 * This extracts the table logic to make it reusable across different components.
 *
 * @param options Configuration options for the data table
 * @returns Reactive table instance and state variables
 *
 * @example
 * ```typescript
 * // In your component
 * import { useDataTable } from '$lib/composables/useDataTable';
 *
 * const { table, globalFilterTableState, rowSelectionState, sortingState, visibilityState } =
 *   useDataTable({
 *     columns: yourColumns,
 *     data: yourData,
 *     getRowId: (row) => row.id.toString()
 *   });
 * ```
 */
export function useDataTable<TData extends RowData>(
	options: DataTableOptions<TData>
): DataTableReturn<TData> {
	const {
		columns,
		data,
		getRowId = (originalRow: TData) => {
			// Type assertion to handle cases where TData might not have an id property
			const row = originalRow as Record<string, unknown>;
			return (row.id as string)?.toString() || JSON.stringify(originalRow);
		},
		globalFilterFn = 'includesString' as FilterFnOption<TData>,
		initialRowSelection = {},
		initialSorting = [],
		initialColumnVisibility = {},
		initialGlobalFilter = undefined
	} = options;

	// State variables for table functionality
	let globalFilterTableState = $state<GlobalFilterTableState | undefined>(initialGlobalFilter);
	let rowSelectionState: RowSelectionState = $state(initialRowSelection);
	let sortingState = $state<SortingState>(initialSorting);
	let visibilityState = $state<VisibilityState>(initialColumnVisibility);

	// Create the reactive table
	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		globalFilterFn,
		onGlobalFilterChange: (updater) => {
			if (typeof updater === 'function') {
				globalFilterTableState = updater(globalFilterTableState);
			} else {
				globalFilterTableState = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sortingState = updater(sortingState);
			} else {
				sortingState = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelectionState = updater(rowSelectionState);
			} else {
				rowSelectionState = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				visibilityState = updater(visibilityState);
			} else {
				visibilityState = updater;
			}
			// Call the external callback if provided
			if (options.onColumnVisibilityChange) {
				options.onColumnVisibilityChange(visibilityState);
			}
		},
		state: {
			get rowSelection() {
				return rowSelectionState;
			},
			get globalFilter() {
				return globalFilterTableState;
			},
			get sorting() {
				return sortingState;
			},
			get columnVisibility() {
				return visibilityState;
			}
		},
		getRowId
	});

	return {
		table
		// globalFilterTableState,
		// rowSelectionState,
		// sortingState,
		// visibilityState
	};
}
