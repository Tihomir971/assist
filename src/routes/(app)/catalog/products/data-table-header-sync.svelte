<script lang="ts">
	import type { RowSelectionState } from '@tanstack/table-core';
	import type { SubmitFunction } from '@sveltejs/kit';
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

	/*	const submitCenotekaSync: SubmitFunction = ({}) => {
		return async ({ result }) => {
			console.log('result', result);
			if (result.type === 'success') {
				const data = result.data;

				if (data && data.success) {
					toast.success('Cenoteka Sync', {
						description: data.message || 'Successfully synchronized!',
						action: {
							label: 'Undo',
							onClick: () => console.info('Undo')
						}
					});
					$selectedDataIds = {};
					await invalidate('catalog:products');
				} else {
					toast.error('Cenoteka Sync', {
						description: data?.message || 'Unknown error occurred'
					});
				}
			} else if (result.type === 'error') {
				toast.error('Cenoteka Sync', {
					description: `Error: ${result.error.message || 'Unknown error occurred'}`
				});
			} else if (result.type === 'failure') {
				toast.error('Cenoteka Sync', {
					description: `Action failed: ${result.data?.message || 'Unknown error occurred'}`
				});
			}
		};
	};
	let formElExcel: HTMLFormElement;
	let formElIdea: HTMLFormElement;
	let formElCenoteka: HTMLFormElement;
	
	$: strSelectedDataIds = Object.keys($selectedDataIds).map((x) => parseInt(x)); */
	let formElErpSyncProd: HTMLFormElement;
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
			<DropdownMenu.Item>Get Cenoteka</DropdownMenu.Item>
			<DropdownMenu.Item>Get Idea</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- <DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
		ERP <ChevronDown class="ml-2 h-4 w-4" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<form
			method="post"
			action="/catalog?/getErpInfo"
			use:enhance={submitSyncStock}
			bind:this={formElErpSyncProd}
		>
			<input type="hidden" name="ids" value={strSelectedDataIds} />
			<DropdownMenu.Item
				onclick={() => {
					formElErpSyncProd.requestSubmit();
				}}
			>
				Sync Replenish from ERP
			</DropdownMenu.Item>
		</form>

		<form
			method="post"
			action="/catalog?/getCenotekaInfo"
			use:enhance={submitCenotekaSync}
			bind:this={formElCenoteka}
		>
			<input type="hidden" name="ids" value={strSelectedDataIds} />
			<input type="hidden" name="source" value={2} />
			<DropdownMenu.Item
				onclick={() => {
					formElCenoteka.requestSubmit();
				}}
			>
				Get Cenoteka Info
			</DropdownMenu.Item>
		</form>
		<form
			method="post"
			action="/catalog?/getCenotekaInfo"
			use:enhance={submitCenotekaSync}
			bind:this={formElIdea}
		>
			<input type="hidden" name="ids" value={strSelectedDataIds} />
			<input type="hidden" name="source" value={4} />
			<DropdownMenu.Item
				onclick={() => {
					formElIdea.requestSubmit();
				}}
			>
				Get Idea Info
			</DropdownMenu.Item>
		</form>
	</DropdownMenu.Content>
</DropdownMenu.Root> -->

<form
	bind:this={formElErpSyncProd}
	method="post"
	action="/catalog?/getErpInfo"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			console.log('result', result);

			if (result.type === 'success') {
				// do something...
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
