<script lang="ts" generics="TData">
	import type { Table as TanstackTable } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button';
	import { SelectLookupZag } from '$lib/components/zag';

	type Props = {
		table: TanstackTable<TData>;
		count: number;
		page: number;
		perPage: number;
		onPageChange: (newPage: number) => void;
		onPerPageChange: (newPerPage: number) => void;
	};

	let { table, count, page, perPage, onPageChange, onPerPageChange }: Props = $props();

	const totalPages = $derived(Math.ceil(count / perPage));
	const showingFrom = $derived((page - 1) * perPage + 1);
	const showingTo = $derived(Math.min(showingFrom + perPage - 1, count));

	const pageSizeOptions = [
		{ value: 10, label: '10' },
		{ value: 20, label: '20' },
		{ value: 50, label: '50' },
		{ value: 100, label: '100' }
	];
</script>

<div class="flex items-center justify-between px-2 py-4">
	<div class="flex-1 text-sm text-muted-foreground">
		{table.getFilteredSelectedRowModel().rows.length} of {table.getRowCount()} row(s) selected.
	</div>
	<div class="flex items-center space-x-6 lg:space-x-8">
		<div class="flex items-center space-x-2">
			<p class="text-sm font-medium">Rows per page</p>
			<SelectLookupZag
				bind:value={perPage}
				items={pageSizeOptions}
				onValueChange={(details) => onPerPageChange(Number(details.value[0]))}
			/>
		</div>
		<div class="flex w-[100px] items-center justify-center text-sm font-medium">
			Page {page} of {totalPages}
		</div>
		<div class="flex items-center space-x-2">
			<Button variant="outline" size="sm" onclick={() => onPageChange(1)} disabled={page === 1}>
				First
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPageChange(page - 1)}
				disabled={page === 1}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPageChange(page + 1)}
				disabled={page === totalPages}
			>
				Next
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPageChange(totalPages)}
				disabled={page === totalPages}
			>
				Last
			</Button>
		</div>
	</div>
</div>
