import { DataTableConfigBuilder, columnTypes } from '$lib/utils/data-table-config.builder';
import type { Tables } from '$lib/types/supabase';
import { renderComponent, RenderComponentConfig } from '$lib/components/walker-tx/render-component';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import type { ColumnDef } from '$lib/components/walker-tx';

export type AttributeSet = Tables<'m_attributeset'>;

const columns: ColumnDef<AttributeSet>[] = [
	columnTypes.hiddenId('id'),
	columnTypes.text('name', 'Name'),
	columnTypes.text('code', 'Code'),
	{
		accessorKey: 'is_active',
		header: 'Active',
		enableColumnFilter: true,
		cell: ({ cell }) =>
			renderComponent(Checkbox, {
				checked: !!cell.getValue(),
				disabled: true
			}),
		filterFn: (row, columnId, filterValue) => {
			if (filterValue === null || filterValue === undefined) return true;
			return row.original.is_active === filterValue;
		}
	},
	{
		id: 'actions',
		enableColumnFilter: false,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cell: ({ row }) => new RenderComponentConfig(DataTableActions as any, { id: row.original.id })
	}
];

export const attributeSetsTableConfig = new DataTableConfigBuilder<AttributeSet>()
	.title('Attribute Sets')
	.columns(columns)
	.createButton('Create Attribute Set', '/catalog/product-attributes/attribute-sets/edit')
	.mode('client')
	.deleteAction('?/delete')
	.addFilter({
		name: 'name',
		label: 'Name',
		type: 'text',
		placeholder: 'Filter by name...',
		field: 'name',
		operator: 'ilike'
	})
	.addFilter({
		name: 'code',
		label: 'Code',
		type: 'text',
		placeholder: 'Filter by code...',
		field: 'code',
		operator: 'ilike'
	})
	.addFilter({
		name: 'is_active',
		label: 'Active',
		type: 'boolean',
		field: 'is_active',
		operator: 'eq',
		dbType: 'boolean'
	})
	.build();
