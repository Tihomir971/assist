import type { ColumnDef } from '@tanstack/table-core';
import type { Product } from './types';
import { DateHelper, NumberFormatter } from '$lib/scripts/intl';
import { renderSnippet } from '$lib/components/ui/data-table';
import { rightAlignSnippet } from '$lib/utils/common-snippets.svelte';
import { ColumnHeader } from '$lib/components/custom-table/snippets.svelte';

const numberFormatter = new NumberFormatter();
const dateFormatter = new DateHelper();

export const tableColumns: ColumnDef<Product>[] = [
	{
		accessorKey: 'vendorproductno',
		header: 'PN'
	},
	{
		accessorKey: 'barcode',
		header: 'Barcode'
	},
	{
		accessorKey: 'manufacturer',
		header: 'Manufacturer'
	},
	{
		accessorKey: 'name',
		// header: 'Name',
		header: ({ column }) =>
			renderSnippet(ColumnHeader, {
				column,
				title: 'Name'
			}),
		meta: {
			filterType: 'text' // 'text', 'select', or 'boolean'
		}
	},
	{
		accessorKey: 'pricelist',
		header: 'Price',
		cell: ({ getValue }) => {
			const value = getValue() as number;

			return renderSnippet(rightAlignSnippet, {
				value: value ? numberFormatter.format(value) : '0'
			});
		},
		enableColumnFilter: false
	},
	{
		accessorKey: 'valid_from',
		header: 'From',
		cell: ({ getValue }) => {
			const value = getValue() as string;

			return renderSnippet(rightAlignSnippet, {
				value: dateFormatter.formatDateOnly(value)
			});
		}
	},
	{
		accessorKey: 'valid_to',
		header: 'To',
		cell: ({ getValue }) => {
			const value = getValue() as string;

			return renderSnippet(rightAlignSnippet, {
				value: dateFormatter.formatDateOnly(value)
			});
		}
	},
	{
		accessorKey: 'vendorcategory',
		header: 'Category'
	}
];
