<script lang="ts">
	import type { TableViewModel } from 'svelte-headless-table';
	import type { ProductSchema } from '$lib/types/zod.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';

	export let tableModel: TableViewModel<ProductSchema>;
	//export let data: SuperValidated<Infer<ProductSelectSchema>>;

	const { pluginStates } = tableModel;
	const { selectedDataIds } = pluginStates.select;

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
				$selectedDataIds = {};
				await invalidate('catalog:test-table');
			} else if (result.type === 'error') {
				toast.error('Replenish ERP Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
			// use the default behavior for this result type
		};
	};
	const submitIdeaSync: SubmitFunction = ({}) => {
		return async ({ result }) => {
			if (result.type === 'success') {
				// do something...
				toast.success('Idea Sync', {
					description: `Successfully syncronised!`,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});
				$selectedDataIds = {};
				await invalidate('catalog:test-table');
			} else if (result.type === 'error') {
				toast.error('Idea Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
			// use the default behavior for this result type
		};
	};
	const submitCenotekaSync: SubmitFunction = ({}) => {
		return async ({ result }) => {
			if (result.type === 'success') {
				// do something...
				toast.success('Cenoteka Sync', {
					description: `Successfully syncronised!`,
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				});
				$selectedDataIds = {};
				await invalidate('catalog:test-table');
			} else if (result.type === 'error') {
				toast.error('Cenoteka Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
			// use the default behavior for this result type
		};
	};
	let formElErpSyncProd: HTMLFormElement;
	let formElErp: HTMLFormElement;
	let formElIdea: HTMLFormElement;
	let formElCenoteka: HTMLFormElement;

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
			<!-- <input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} /> -->
			<input type="hidden" name="ids" value={strSelectedDataIds} />
			<DropdownMenu.Item
				on:click={() => {
					formElErpSyncProd.requestSubmit();
				}}
			>
				Sync Replenish from ERP
			</DropdownMenu.Item>
		</form>

		<DropdownMenu.Item
			on:click={() => {
				formElErp.requestSubmit();
			}}
		>
			Export to Excel
		</DropdownMenu.Item>
		<form
			method="POST"
			action="/catalog?/getCenotekaInfo"
			use:enhance={submitCenotekaSync}
			bind:this={formElCenoteka}
		>
			<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
			<DropdownMenu.Item
				on:click={() => {
					formElCenoteka.requestSubmit();
				}}
			>
				Get Cenoteka Info
			</DropdownMenu.Item>
		</form>
		<form
			method="POST"
			action="/catalog?/getIdeaInfo"
			use:enhance={submitIdeaSync}
			bind:this={formElIdea}
		>
			<input type="hidden" name="ids" value={JSON.stringify(strSelectedDataIds)} />
			<DropdownMenu.Item
				on:click={() => {
					formElIdea.requestSubmit();
				}}
			>
				Get Idea Info
			</DropdownMenu.Item>
		</form>
	</DropdownMenu.Content>
</DropdownMenu.Root>
