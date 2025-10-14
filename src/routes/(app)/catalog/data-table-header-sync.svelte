<script lang="ts">
	import type { RowSelectionState } from '@tanstack/table-core';
	import { invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	//Components
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	//Icons
	import PhCaretDown from '~icons/ph/caret-down';
	// Remote functions
	import { scrapperSearchProducts, scrapperGetMarketInfo } from '$lib/remote/scrapper.remote';

	let { rowSelectionState = $bindable() }: { rowSelectionState: RowSelectionState } = $props();
	let strRowSelectionState = $derived(Object.keys(rowSelectionState).map((x) => x));

	let formElErpSyncProd: HTMLFormElement;
	// let formElBarcodes: HTMLFormElement;

	// New function using remote command instead of form action
	const handleGetMarketInfo = async () => {
		try {
			const result = await scrapperGetMarketInfo({
				ids: strRowSelectionState.join(','),
				type: 'get'
			});

			invalidate('catalog:products');

			toast.success('Cenoteka Sync', {
				description: result.message || 'Successfully synchronized!',
				action: {
					label: 'Undo',
					onClick: () => console.info('Undo')
				}
			});

			// Clear row selection after successful operation
			rowSelectionState = {};
		} catch (error) {
			console.error('Error getting market info:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			toast.error('Cenoteka Sync', {
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

			invalidate('catalog:products');

			toast.success('Cenoteka Sync', {
				description: result.message || 'Successfully synchronized!',
				action: {
					label: 'Undo',
					onClick: () => console.info('Undo')
				}
			});

			// Clear row selection after successful operation
			rowSelectionState = {};
		} catch (error) {
			console.error('Error searching by barcodes:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			toast.error('Cenoteka Sync', {
				description: errorMessage
			});
		}
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">Sync <PhCaretDown class="ml-2" /></Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Item
				onSelect={() => {
					if (formElErpSyncProd) {
						formElErpSyncProd.requestSubmit();
					}
				}}
			>
				Get ERP Products
			</DropdownMenu.Item>

			<DropdownMenu.Separator />
			<DropdownMenu.Item onSelect={() => handleGetMarketInfo()}>Get Market Info</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => handleSearchProducts()}>
				Search by Barcodes
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<form
	bind:this={formElErpSyncProd}
	method="post"
	action="/catalog?/getErpInfo"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Replenish ERP Sync', {
					description: `Successfully updated!`,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});

				rowSelectionState = {};
				invalidate('catalog:products');
			} else if (result.type === 'error') {
				toast.error('Replenish ERP Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
		};
	}}
>
	<input type="hidden" name="ids" value={strRowSelectionState} />
</form>

<!-- <form
	bind:this={formElBarcodes}
	method="post"
	action="/catalog?/searchVendorProducts"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				const data = result.data;
				if (data && data.success) {
					toast.success('Cenoteka Sync', {
						action: {
							label: 'Undo',
							onClick: () => console.info('Undo')
						}
					});
				} else {
					toast.error('Cenoteka Sync', {
					});
				}

				rowSelectionState = {};
				invalidate('catalog:products');
			} else if (result.type === 'error') {
				toast.error('Replenish ERP Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
		};
	}}
>
	<input type="hidden" name="ids" value={strRowSelectionState} />
	<input type="hidden" name="source" bind:this={sourceInput} value={2} />
	<input type="hidden" name="type" bind:this={typeInput} value={'search'} />
</form> -->
