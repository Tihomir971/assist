import { createColumnHelper, renderComponent } from '$lib/components/walker-tx';
import TableCheckbox from '$lib/components/walker-tx/table-checkbox.svelte';
import DataTableActions from './data-table-actions.svelte';
import type { TableRow } from './table-types';

const colHelp = createColumnHelper<TableRow>();
export const columnDefs = [
	colHelp.display({
		id: 'select',
		header: ({ table }) =>
			renderComponent(TableCheckbox, {
				checked:
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate'),
				onchange: () => {
					table.toggleAllRowsSelected();
				}
			}),
		cell: ({ row }) =>
			renderComponent(TableCheckbox, {
				checked: row.getIsSelected(),
				onchange: () => {
					row.toggleSelected();
				}
			}),
		enableHiding: false
	}),
	colHelp.accessor('sku', { header: 'SKU' }),
	colHelp.accessor('name', { header: 'Name' }),
	colHelp.accessor('qty_wholesale', { header: 'Wholesale' }),
	colHelp.accessor('qty_retail', { header: 'Retail' }),
	colHelp.accessor('level_min', { header: 'Min Level' }),
	colHelp.accessor('level_max', { header: 'Max Level' }),
	colHelp.accessor('id', {
		header: '',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, { id: row.original.id.toString() });
		},
		enableSorting: false
	})
];
