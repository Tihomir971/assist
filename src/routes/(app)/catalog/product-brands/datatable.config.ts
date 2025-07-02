import { DataTableConfigBuilder, columnTypes } from '$lib/utils/data-table-config.builder';
import DataTableActions from '$lib/components/ui/data-table-actions.svelte';
import { RenderComponentConfig } from '$lib/components/walker-tx/render-component';
import type { Tables } from '@tihomir971/assist-shared';
import type { ColumnDef } from '@tanstack/svelte-table';

export type BrandData = Tables<'m_product_brands'>;

const columns: ColumnDef<BrandData>[] = [
	columnTypes.hiddenId('id'),
	columnTypes.text('name', 'Name'),
	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => {
			const value = row.original.description;
			return value ? (value.length > 50 ? value.substring(0, 50) + '...' : '-') : '-';
		}
	},
	columnTypes.text('website_url', 'Website'),
	{
		accessorKey: 'logo_url',
		header: 'Logo',
		cell: ({ row }) => {
			const logoUrl = row.original.logo_url;
			if (!logoUrl) return '-';
			return {
				$$typeof: Symbol.for('svelte.snippet'),
				$$render: () =>
					`<img src="${logoUrl}" alt="${row.original.name} logo" class="w-8 h-8 object-contain rounded" />`
			};
		}
	},
	columnTypes.boolean('is_active', 'Active'),
	{
		id: 'actions',
		enableColumnFilter: false,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cell: ({ row }) => new RenderComponentConfig(DataTableActions as any, { id: row.original.id })
	}
];

export const brandsTableConfig = new DataTableConfigBuilder<BrandData>()
	.title('Product Brands')
	.columns(columns)
	.createButton('Create Brand', '/catalog/product-brands/edit')
	.mode('client')
	.deleteAction('?/delete')
	.addFilter({
		name: 'name',
		label: 'Name',
		type: 'text',
		placeholder: 'Filter by name...'
	})
	.addFilter({
		name: 'description',
		label: 'Description',
		type: 'text',
		placeholder: 'Filter by description...'
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
