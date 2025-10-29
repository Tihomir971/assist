import { DataTableConfigBuilder, columnTypes } from '$lib/utils/data-table-config.builder';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import {
	renderComponent,
	RenderComponentConfig
} from '$lib/components/ui/data-table/render-helpers';
import type { Tables } from '@tihomir971/assist-shared';
import type { CellContext, ColumnDef } from '@tanstack/table-core';
import { CheckboxArk } from '$lib/components/ark';

export type AttributeWithGroup = Tables<'m_attribute'> & {
	m_attribute_group: { name: string };
	c_uom: { name: string; uomsymbol: string | null } | null;
};

function getAttributeTypeDisplay(type: string) {
	switch (type) {
		case 'single_select':
			return 'Single Select';
		case 'multi_select':
			return 'Multi Select';
		case 'text':
			return 'Text';
		case 'number':
			return 'Number';
		case 'boolean':
			return 'Boolean';
		case 'date':
			return 'Date';
		default:
			return type;
	}
}

const columns: ColumnDef<AttributeWithGroup>[] = [
	columnTypes.hiddenId('id'),
	{
		accessorKey: 'code',
		header: 'Code',
		enableColumnFilter: true
	},
	{
		accessorKey: 'name',
		header: 'Name',
		enableColumnFilter: true
	},
	{
		id: 'm_attribute_group.name',
		accessorFn: (row) => row.m_attribute_group?.name,
		header: 'Group',
		enableColumnFilter: true,
		filterFn: (row, filterValue) => {
			if (!filterValue) return true;
			// filterValue is the ID from the lookup dropdown
			// We need to match against the actual attribute_group_id
			return row.original.attribute_group_id === Number(filterValue);
		}
	},
	{
		accessorKey: 'attribute_type',
		header: 'Type',
		enableColumnFilter: true,
		cell: (context: CellContext<AttributeWithGroup, unknown>) =>
			getAttributeTypeDisplay(context.cell.getValue() as string),
		filterFn: (row, columnId, filterValue) => {
			if (!filterValue) return true;
			return row.original.attribute_type === filterValue;
		}
	},
	{
		id: 'c_uom.uomsymbol',
		accessorFn: (row) => row.c_uom?.uomsymbol,
		header: 'UOM',
		enableColumnFilter: false
	},
	{
		accessorKey: 'description',
		header: 'Description',
		enableColumnFilter: true
	},
	{
		accessorKey: 'is_active',
		header: 'Active',
		enableColumnFilter: true,
		cell: ({ cell }) =>
			renderComponent(CheckboxArk, {
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

export const attributesTableConfig = new DataTableConfigBuilder<AttributeWithGroup>()
	.title('Attributes')
	.columns(columns)
	.createButton('Create Attribute', '/catalog/product-attributes/attributes/edit')
	.mode('client')
	.deleteAction('?/delete')
	.addFilter({
		name: 'name',
		label: 'Name',
		type: 'text',
		placeholder: 'Filter by name...'
	})
	.addFilter({
		name: 'code',
		label: 'Code',
		type: 'text',
		placeholder: 'Filter by code...'
	})
	.addFilter({
		name: 'attribute_type',
		label: 'Type',
		type: 'select',
		lookupDataKey: 'attributeTypes',
		placeholder: 'All types',
		field: 'attribute_type',
		operator: 'eq'
	})
	.addFilter({
		name: 'm_attribute_group.name',
		label: 'Group',
		type: 'select',
		lookupDataKey: 'attributeGroups',
		placeholder: 'All groups',
		field: 'attribute_group_id',
		operator: 'eq',
		dbType: 'number'
	})
	.addFilter({
		name: 'is_active',
		label: 'Status',
		type: 'boolean',
		placeholder: 'All statuses',
		field: 'is_active',
		operator: 'eq',
		dbType: 'boolean'
	})
	.build();
