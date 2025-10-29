import { RenderComponentConfig } from '$lib/components/ui/data-table/render-helpers';
import type { Snippet } from 'svelte';
import { getAppContext } from '$lib/context';
import type { ColumnDef } from '@tanstack/table-core';
import { CheckboxArk } from '$lib/components/ark';

export type FilterType = 'text' | 'select' | 'boolean';

export type SelectFilterOption = {
	value: string | number;
	label: string;
};

export type FilterDefinition = {
	name: string; // Corresponds to the URL search param name
	label: string;
	type: FilterType;
	placeholder?: string;
	options?: SelectFilterOption[]; // For select filters
	lookupDataKey?: string; // Key in the load function's return data for dynamic options
	field?: string; // Database field name if different from 'name'
	operator?: 'eq' | 'ilike' | 'gte' | 'lte' | 'in'; // Supabase operator for server-side filtering
	dbType?: 'number' | 'boolean' | 'array'; // Database type for server-side filtering
};

export type DataTableConfig<TData> = {
	title: string;
	columns: ColumnDef<TData>[];
	filters: FilterDefinition[];
	createButton?: {
		label: string;
		href: string;
	};
	mode: 'client' | 'server';
	showGlobalFilter: boolean;
	deleteAction?: string; // Action path for delete operation
	rowActions?: Snippet<[{ row: TData }]>; // Snippet for custom row actions
};

export class DataTableConfigBuilder<TData> {
	private config: Partial<DataTableConfig<TData>> = {
		filters: [],
		mode: 'client', // Default to client mode
		showGlobalFilter: true
	};

	title(title: string): this {
		this.config.title = title;
		return this;
	}

	columns(columns: ColumnDef<TData>[]): this {
		this.config.columns = columns;
		return this;
	}

	addFilter(filter: FilterDefinition): this {
		this.config.filters?.push(filter);
		return this;
	}

	createButton(label: string, href: string): this {
		this.config.createButton = { label, href };
		return this;
	}

	mode(mode: 'client' | 'server'): this {
		this.config.mode = mode;
		if (mode === 'server') {
			this.config.showGlobalFilter = false;
		}
		return this;
	}

	deleteAction(action: string): this {
		this.config.deleteAction = action;
		return this;
	}

	rowActions(snippet: Snippet<[{ row: TData }]>): this {
		this.config.rowActions = snippet;
		return this;
	}

	build(): DataTableConfig<TData> {
		if (!this.config.title) {
			throw new Error('DataTableConfig must have a title.');
		}
		if (!this.config.columns) {
			throw new Error('DataTableConfig must have columns defined.');
		}
		return this.config as DataTableConfig<TData>;
	}
}

export const columnTypes = {
	hiddenId: <TData>(
		accessorKey: keyof TData & string = 'id' as keyof TData & string
	): ColumnDef<TData> => ({
		accessorKey,
		header: 'ID',
		enableColumnFilter: false,
		enableSorting: false,
		meta: {
			className: 'hidden'
		}
	}),
	text: <TData>(
		accessorKey: keyof TData & string,
		header: string,
		sortable = true
	): ColumnDef<TData> => ({
		accessorKey,
		header,
		enableSorting: sortable
	}),
	boolean: <TData>(
		accessorKey: keyof TData & string,
		header: string,
		sortable = false
	): ColumnDef<TData> => ({
		accessorKey,
		header,
		enableSorting: sortable,
		cell: ({ cell }) => {
			return new RenderComponentConfig(CheckboxArk, {
				checked: cell.getValue() as boolean,
				disabled: true
			});
		},
		meta: {
			className: 'w-20 text-center [&:has([role=checkbox])]:pr-2',
			cellWrapperClass: 'flex justify-center'
		}
	}),
	link: <TData>(
		accessorKey: keyof TData & string,
		header: string,
		hrefBuilder: (row: TData) => string
	): ColumnDef<TData> => ({
		accessorKey,
		header,
		cell: ({ row, getValue }) => {
			const value = getValue();
			const href = hrefBuilder(row.original);
			return {
				$$typeof: Symbol.for('svelte.snippet'),
				$$render: () => `<a href="${href}">${value}</a>`
			};
		}
	}),
	date: <TData>(accessorKey: keyof TData & string, header: string): ColumnDef<TData> => ({
		accessorKey,
		header,
		cell: ({ cell }) => {
			const value = cell.getValue() as string | null;
			if (!value) return '';
			try {
				return new Date(value).toLocaleDateString(getAppContext().userLocale);
			} catch {
				return value;
			}
		}
	}),
	dateTime: <TData>(accessorKey: keyof TData & string, header: string): ColumnDef<TData> => ({
		accessorKey,
		header,
		cell: ({ cell }) => {
			const value = cell.getValue() as string | null;
			if (!value) return '';
			try {
				return new Date(value).toLocaleString(getAppContext().userLocale);
			} catch {
				return value;
			}
		}
	}),
	custom: <TData, TValue>(
		accessorKey: keyof TData & string,
		header: string,
		cellSnippet: Snippet<[{ row: TData; cell: TValue }]>
	): ColumnDef<TData> => ({
		accessorKey,
		header,
		cell: ({ row, cell }) => cellSnippet({ row: row.original, cell: cell.getValue() as TValue })
	})
};
