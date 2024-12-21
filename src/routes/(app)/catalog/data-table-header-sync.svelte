<script lang="ts">
	import type { RowSelectionState } from '@tanstack/table-core';
	import { invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	//Components
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	//Icons
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

	let { rowSelectionState = $bindable() }: { rowSelectionState: RowSelectionState } = $props();
	let strRowSelectionState = $derived(Object.keys(rowSelectionState).map((x) => x));

	let formElMarket: HTMLFormElement;
	let formElErpSyncProd: HTMLFormElement;
	let sourceInput: HTMLInputElement;

	const submitWithSource = (source: number) => {
		if (sourceInput && formElMarket) {
			sourceInput.value = source.toString();
			formElMarket.requestSubmit();
		}
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">Sync <ChevronDown class="ml-2 size-4" /></Button>
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
			<DropdownMenu.Item onSelect={() => submitWithSource(2)}>Get Cenoteka</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => submitWithSource(4)}>Get Idea</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => submitWithSource(6)}>Get Tehnomedia</DropdownMenu.Item>
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
				invalidate('catalog');
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

<form
	bind:this={formElMarket}
	method="post"
	action="/catalog?/getMarketInfo"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			console.log('result', result);

			if (result.type === 'success') {
				const data = result.data;
				if (data && data.success) {
					toast.success('Cenoteka Sync', {
						/* description: data.message || 'Successfully synchronized!', */
						action: {
							label: 'Undo',
							onClick: () => console.info('Undo')
						}
					});
				} else {
					toast.error('Cenoteka Sync', {
						/* description: data?.message || 'Unknown error occurred' */
					});
				}

				rowSelectionState = {};
				invalidate('catalog');
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
</form>
