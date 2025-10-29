import { createColumnHelper } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';
import type { TableRow } from './table-types';
import { renderComponent } from '$lib/components/ui/data-table';
import { Checkbox } from '$lib/components/ark/checkbox';

const columnHelper = createColumnHelper<TableRow>();
export const columnDefs = [
	columnHelper.display({
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked:
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate'),
				onCheckedChange: () => {
					table.toggleAllRowsSelected();
				}
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: () => {
					row.toggleSelected();
				}
			}),
		enableHiding: false
	}),
	columnHelper.accessor('sku', { header: 'SKU' }),
	columnHelper.accessor('name', { header: 'Name' }),
	columnHelper.accessor('qty_wholesale', { header: 'Wholesale' }),
	columnHelper.accessor('qty_retail', { header: 'Retail' }),
	columnHelper.accessor('level_min', { header: 'Min Level' }),
	columnHelper.accessor('level_max', { header: 'Max Level' }),
	columnHelper.accessor('id', {
		header: '',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, { id: row.original.id.toString() });
		},
		enableSorting: false
	})
];
