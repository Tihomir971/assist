import { renderComponent } from '$lib/components/ui/data-table';
import type { Tables } from '$lib/types/supabase.types';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Attributes = Tables<'m_attribute'> & { m_attribute_group: { name: string } };

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
export const columns: ColumnDef<Attributes>[] = [
	{
		accessorKey: 'code',
		header: 'Code'
	},
	{
		accessorKey: 'name',
		header: 'Name'
	},
	{
		accessorKey: 'm_attribute_group.name',
		header: 'Group'
	},
	{
		accessorKey: 'attribute_type',
		header: 'Type',
		cell: ({ cell }) => {
			return getAttributeTypeDisplay(cell.getValue() as string);
		}
	},
	{
		accessorKey: 'description',
		header: 'Description'
	},
	{
		accessorKey: 'is_active',
		header: 'Active'
	},
	{
		accessorKey: 'id',
		cell: ({ row }) => {
			const id = row.original.id;
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, {
				onclick: () => goto(`${page.url.pathname}/edit/${id}`)
			});
		}
	}
];
