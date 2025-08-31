import { DataTableConfigBuilder, columnTypes } from '$lib/utils/data-table-config.builder';
import type { Database, Tables } from '$lib/types/supabase';
import type { ColumnDef } from '@tanstack/svelte-table';
import { renderComponent } from '$lib/components/walker-tx/render-component';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import Checkbox from '$lib/components/zag/checkbox/checkbox.svelte';

export type AttributeGroupType = Tables<'m_attribute_group'>;

const columns: ColumnDef<AttributeGroupType>[] = [
	columnTypes.hiddenId('id'),
	columnTypes.text('name', 'Name'),
	columnTypes.text('code', 'Code'),
	{
		accessorKey: 'is_active',
		header: 'Active',
		cell: ({ cell }) =>
			renderComponent(Checkbox, {
				checked: !!cell.getValue(),
				disabled: true
			}),
		filterFn: (row, columnId, filterValue) => {
			if (filterValue === null || filterValue === undefined) return true;
			return row.original.is_active === filterValue;
		},
		enableSorting: false
	},
	{
		id: 'actions',
		enableColumnFilter: false,
		enableSorting: false,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cell: ({ row }) => renderComponent(DataTableActions as any, { id: row.original.id })
	}
];

export const attributeGroupsTableConfig = new DataTableConfigBuilder<AttributeGroupType>()
	.title('Attribute Groups')
	.columns(columns)
	.createButton('Create Attribute Group', '/catalog/product-attributes/attribute-groups/edit')
	.mode('client')
	.deleteAction('?/delete')
	.addFilter({
		name: 'is_active',
		label: 'Active',
		type: 'boolean',
		field: 'is_active',
		operator: 'eq'
	})
	.build();
