import type { Tables } from '$lib/types/supabase.types';
import type { ColumnDef } from '@tanstack/table-core';

export const columns: ColumnDef<Tables<'c_bpartner'>>[] = [
	{
		accessorKey: 'id',
		header: 'ID'
	},
	{
		accessorKey: 'value',
		header: 'Value'
	},
	{
		accessorKey: 'taxid',
		header: 'PIB/MB'
	},
	{
		accessorKey: 'name',
		header: 'Name'
	}
];
