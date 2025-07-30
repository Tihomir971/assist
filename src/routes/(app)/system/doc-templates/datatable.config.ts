import { DataTableConfigBuilder, columnTypes } from '$lib/utils/data-table-config.builder';
import type { Tables } from '@tihomir971/assist-shared';
import type { ColumnDef } from '@tanstack/svelte-table';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import { renderComponent } from '$lib/components/walker-tx/render-component';

export type DocTemplateType = Tables<'doc_template'>;

const columns: ColumnDef<DocTemplateType>[] = [
	columnTypes.hiddenId('id'),
	columnTypes.text('name', 'Name'),
	columnTypes.text('description', 'Description'),
	columnTypes.boolean('is_active', 'Active'),
	columnTypes.dateTime('updated_at', 'Last Updated'),
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

export const docTemplateConfig = new DataTableConfigBuilder<DocTemplateType>()
	.title('Document Templates')
	.columns(columns)
	.createButton('Create Template', '/system/doc-templates/edit')
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
		name: 'is_active',
		label: 'Active',
		type: 'boolean',
		field: 'is_active',
		operator: 'eq'
	})
	.build();
