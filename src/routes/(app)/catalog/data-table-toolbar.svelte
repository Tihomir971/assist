<script lang="ts">
	import type { FlattenedProduct } from './columns.svelte';
	import { invalidate } from '$app/navigation';
	//Components
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	//Icons
	import PhLetterCircleV from '~icons/ph/letter-circle-v';
	import PhFolders from '~icons/ph/folders';
	import PhCaretDown from '~icons/ph/caret-down';
	import { SelectLookupZag } from '$lib/components/zag';
	import type { GlobalFilterTableState, Table } from '@tanstack/table-core';
	import { toast } from 'svelte-sonner';

	// Remote functions
	import { scrapperSearchProducts, scrapperGetMarketInfo } from '$lib/remote/scrapper.remote';
	import { getErpInfo } from '$lib/remote/connector.remote';
	import { catalogSearchParamsSchema } from './schema.search-params';
	import { createSearchParamsHelper } from '$lib/utils/searchParams';
	import { page } from '$app/state';

	// Koristi reaktivne search params - ovo će reagovati na promene URL-a
	const searchParamsHelper = createSearchParamsHelper(catalogSearchParamsSchema);
	const searchParams = $derived(searchParamsHelper.parse(page.url.searchParams));

	type Props = {
		globalFilterTableState: GlobalFilterTableState | undefined;
		table: Table<FlattenedProduct>;
		onAddToCart: () => void;
		warehouses: Array<{ value: string; label: string }>;
	};
	let { table, globalFilterTableState = $bindable(), onAddToCart, warehouses }: Props = $props();

	const toggleGroupValue: string[] = $derived([
		...(searchParams.vat ? ['vat'] : []),
		...(searchParams.sub ? ['sub'] : [])
	]);

	const reports = [
		{ value: 'all', label: 'All Products' },
		{ value: 'relocation', label: 'Relocation' },
		{ value: 'replenish', label: 'Replenish' }
	];

	function handleSalesGraphClick() {
		const selectedSkus = Object.keys(table.getState().rowSelection).join(',');
		if (selectedSkus) {
			window.open(`/report/salesgraph?skus=${selectedSkus}`, '_blank');
		}
	}

	// Sync functionality from data-table-header-sync.svelte
	let strRowSelectionState = $derived(Object.keys(table.getState().rowSelection));

	// New function using remote command instead of form action
	const handleGetMarketInfo = async () => {
		try {
			const result = await scrapperGetMarketInfo({
				ids: strRowSelectionState.join(','),
				type: 'get'
			});

			// Check if the operation was successful based on the response structure
			if (result.success) {
				invalidate('catalog:products');

				// Show success message with details about the operation
				const successMessage = result.message || 'Successfully synchronized!';
				const details = result.data
					? `Updated: ${result.data.updatedCount || 0}, Errors: ${result.data.errorCount || 0}`
					: '';

				toast.success('Market Info', {
					description: details ? `${successMessage} - ${details}` : successMessage,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});

				// Clear row selection after successful operation
				table.resetRowSelection(true);
			} else {
				// Handle error response from the remote function
				console.error('Market info sync failed:', result.message);
				const errorDetails = result.data?.details
					? `${result.message}. Details: ${result.data.details.join(', ')}`
					: result.message || 'Synchronization failed';

				toast.error('Market Info', {
					description: errorDetails
				});
			}
		} catch (error) {
			// Handle network errors or other exceptions
			console.error('Error getting market info:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			toast.error('Market Info', {
				description: errorMessage
			});
		}
	};

	// New function using remote command instead of form action
	const handleSearchProducts = async () => {
		try {
			const result = await scrapperSearchProducts({
				ids: strRowSelectionState.join(',')
			});

			// Check if the operation was successful based on the response structure
			if (result.success) {
				invalidate('catalog:products');

				// Show success message with details about the operation
				const successMessage = result.message || 'Successfully synchronized!';
				const details = result.data
					? `Processed: ${Array.isArray(result.data) ? result.data.length : 0} results`
					: '';

				toast.success('Cenoteka Sync', {
					description: details ? `${successMessage} - ${details}` : successMessage,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});

				// Clear row selection after successful operation
				table.resetRowSelection(true);
			} else {
				// Handle error response from the remote function
				console.error('Product search failed:', result.message);
				toast.error('Cenoteka Sync', {
					description: result.message || 'Search failed'
				});
			}
		} catch (error) {
			// Handle network errors or other exceptions
			console.error('Error searching by barcodes:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			toast.error('Cenoteka Sync', {
				description: errorMessage
			});
		}
	};

	// New function using remote command instead of form action
	const handleGetErpInfo = async () => {
		try {
			const { data, error } = await getErpInfo({
				ids: strRowSelectionState.join(',')
			});

			// Check if the operation was successful based on the response structure
			if (!error) {
				invalidate('catalog:products');

				// Show success message with details about the operation
				const successMessage = 'Successfully synchronized!';
				const details = `Processed: ${typeof data === 'object' && 'length' in data ? data.length : 'unknown'} items`;
				toast.success('ERP Sync', {
					description: details ? `${successMessage} - ${details}` : successMessage,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});

				// Clear row selection after successful operation
				table.resetRowSelection(true);
			} else {
				// Handle error response from the remote function
				console.error('ERP sync failed:', error);
				toast.error('ERP Sync', {
					description: error.message || 'ERP synchronization failed'
				});
			}
		} catch (error) {
			// Handle network errors or other exceptions
			console.error('Error getting ERP info:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			toast.error('ERP Sync', {
				description: errorMessage
			});
		}
	};
</script>

<div class="flex items-center justify-between gap-4">
	<Input
		type="search"
		value={table.getState().globalFilter}
		oninput={(e) => {
			const target = e.target as HTMLInputElement;
			if (target) {
				table.setGlobalFilter(target.value);
			}
		}}
		placeholder="Filter products..."
		class="max-w-sm"
	/>
	<div class="flex gap-4">
		<Tooltip.Provider>
			<ToggleGroup.Root
				value={toggleGroupValue}
				variant="outline"
				type="multiple"
				onValueChange={(newValue) => {
					// Koristi direktno dodeljivanje - reaktivno će ažurirati URL
					searchParamsHelper.update(page.url, {
						vat: newValue.includes('vat'),
						sub: newValue.includes('sub')
					});

					/* 					urlParams.vat = newValue.includes('vat');
					urlParams.sub = newValue.includes('sub'); */
				}}
			>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<ToggleGroup.Item value="sub" aria-label="Toggle Subcategories" {...props}>
								<PhFolders />
							</ToggleGroup.Item>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Show Subcategories</p>
					</Tooltip.Content>
				</Tooltip.Root>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<ToggleGroup.Item value="vat" aria-label="Toggle VAT" {...props}>
								<PhLetterCircleV />
							</ToggleGroup.Item>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Show VAT</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</ToggleGroup.Root>
		</Tooltip.Provider>

		<Button variant="outline" onclick={onAddToCart}>Add to Cart</Button>
		<Button variant="outline" onclick={handleSalesGraphClick}>Sales Graph</Button>

		<SelectLookupZag
			value={searchParams.report}
			items={reports}
			placeholder="Select report"
			onValueChange={(details) => {
				searchParamsHelper.update(page.url, { report: details.value[0] as any });
			}}
		/>

		<SelectLookupZag
			value={searchParams.wh}
			items={warehouses}
			onValueChange={(details) => {
				searchParamsHelper.update(page.url, { wh: parseInt(details.value[0]) });
			}}
		/>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline">Sync <PhCaretDown class="ml-2" /></Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<DropdownMenu.Item onSelect={() => handleGetErpInfo()}>Get ERP Products</DropdownMenu.Item
					>

					<DropdownMenu.Separator />
					<DropdownMenu.Item onSelect={() => handleGetMarketInfo()}
						>Get Market Info</DropdownMenu.Item
					>
					<DropdownMenu.Item onSelect={() => handleSearchProducts()}
						>Search Web Product</DropdownMenu.Item
					>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline">Columns<PhCaretDown class="ml-2" /></Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						closeOnSelect={false}
						checked={column.getIsVisible()}
						onCheckedChange={(value) => {
							column.toggleVisibility(!!value);
						}}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>
