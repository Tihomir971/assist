<script lang="ts">
	import RadixIconsMixerHorizontal from '$lib/icons/RadixIconsMixerHorizontal.svelte';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { Product } from '../(data)/schemas.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	export let tableModel: TableViewModel<Product>;
	const { pluginStates } = tableModel;
	const { selectedDataIds } = pluginStates.select;
	const { hiddenColumnIds } = pluginStates.hide;
	function handleHide(id: string) {
		hiddenColumnIds.update((ids: string[]) => {
			if (ids.includes(id)) {
				return ids.filter((i) => i !== id);
			}
			return [...ids, id];
		});
	}

	const hidableCols = ['title', 'status', 'priority'];
	const submitSyncStock: SubmitFunction = ({}) => {
		return async ({ result }) => {
			if (result.type === 'success') {
				// do something...
				toast.success('Replenish ERP Sync', {
					description: `Successfully updated!`,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});
			} else if (result.type === 'error') {
				toast.error('Replenish ERP Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
			// use the default behavior for this result type
			await invalidate('catalog:replenish');
		};
	};
	let formElErpSyncProd: HTMLFormElement;
	let formElErp: HTMLFormElement;
	$: strSelectedDataIds = Object.keys($selectedDataIds).map((x) => parseInt(x));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="outline" class="ml-auto" builders={[builder]}>
			ERP <ChevronDown class="ml-2 h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<form
			method="POST"
			action="/catalog?/getErpInfo"
			use:enhance={submitSyncStock}
			bind:this={formElErpSyncProd}
		>
			<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
			<DropdownMenu.Item
				on:click={() => {
					formElErpSyncProd.requestSubmit();
				}}
			>
				Sync Replenish from ERP
			</DropdownMenu.Item>
		</form>
		<form
			method="POST"
			action="/catalog?/getErpInfo"
			use:enhance={submitSyncStock}
			bind:this={formElErp}
		>
			<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
			<DropdownMenu.Item
				on:click={() => {
					formElErp.requestSubmit();
				}}
			>
				Sync Stock
			</DropdownMenu.Item>
		</form>
		<form method="POST" action="/catalog?/getErpInfo" use:enhance bind:this={formElErp}>
			<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
			<DropdownMenu.Item
				on:click={() => {
					formElErp.requestSubmit();
				}}
			>
				Sync Replenish
			</DropdownMenu.Item>
		</form>
	</DropdownMenu.Content>
</DropdownMenu.Root>
{JSON.stringify(strSelectedDataIds)}
