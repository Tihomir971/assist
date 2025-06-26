import { DataTableConfigBuilder, columnTypes } from '$lib/utils/data-table-config.builder';
import type { Tables } from '$lib/types/supabase.types';
import type { ColumnDef } from '@tanstack/svelte-table';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import { RenderComponentConfig } from '$lib/components/walker-tx/render-component';

export type ContactDataType = Tables<'c_bpartner'>;

const columns: ColumnDef<ContactDataType>[] = [
	columnTypes.hiddenId('id'),
	columnTypes.text('display_name', 'Name'),
	columnTypes.text('value', 'Value'),
	columnTypes.text('taxid', 'PIB/MB'),
	columnTypes.boolean('is_active', 'Active'),
	columnTypes.boolean('iscustomer', 'Customer'),
	columnTypes.boolean('isvendor', 'Vendor'),
	{
		id: 'actions',
		enableColumnFilter: false,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cell: (props) => new RenderComponentConfig(DataTableActions as any, { props: props })
	}
];

export const contactsTableConfig = new DataTableConfigBuilder<ContactDataType>()
	.title('Contacts')
	.columns(columns)
	.createButton('Create Contact', '/crm/contacts/edit')
	.mode('client')
	.deleteAction('?/delete')
	.addFilter({
		name: 'name',
		label: 'Name',
		type: 'text',
		placeholder: 'Filter by name...',
		field: 'display_name',
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
	.addFilter({
		name: 'iscustomer',
		label: 'Is Customer',
		type: 'boolean',
		field: 'iscustomer',
		operator: 'eq',
		dbType: 'boolean'
	})
	.addFilter({
		name: 'isvendor',
		label: 'Is Vendor',
		type: 'boolean',
		field: 'isvendor',
		operator: 'eq',
		dbType: 'boolean'
	})
	.build();
