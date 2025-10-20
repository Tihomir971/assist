import { DataTableConfigBuilder, columnTypes } from '$lib/utils/data-table-config.builder';
import type { Tables } from '@tihomir971/assist-shared';
import type { ColumnDef } from '@tanstack/svelte-table';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import { renderComponent } from '$lib/components/ui/data-table/render-helpers';

export type GeneratedDocumentType = Tables<'doc_generated_document'> & {
	doc_template: { name: string } | null;
	created_by_user: { first_name: string | null; last_name: string | null } | null;
};

const columns: ColumnDef<GeneratedDocumentType>[] = [
	columnTypes.hiddenId('id'),
	{
		accessorKey: 'doc_template.name',
		header: 'Template'
	},
	{
		header: 'Created By',
		cell: ({ row }) => {
			const user = row.original.created_by_user;
			if (!user) return 'N/A';
			return `${user.first_name || ''} ${user.last_name || ''}`.trim();
		}
	},
	columnTypes.dateTime('created_at', 'Created At'),
	{
		id: 'actions',
		enableHiding: false,
		enableColumnFilter: false,
		cell: (props) => {
			const rowData = props.row.original;
			return renderComponent(DataTableActions, { id: rowData.id });
		}
	}
];

export const generatedDocumentConfig = new DataTableConfigBuilder<GeneratedDocumentType>()
	.title('Generated Documents')
	.columns(columns)
	.createButton('Generate New Document', '/crm/generate-document/edit')
	.deleteAction('?/delete')
	.addFilter({
		name: 'doc_template_id',
		label: 'Template',
		type: 'select',
		lookupDataKey: 'templates',
		field: 'doc_template_id',
		operator: 'eq',
		dbType: 'number'
	})
	.build();
