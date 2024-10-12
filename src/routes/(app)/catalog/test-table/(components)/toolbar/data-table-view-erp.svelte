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
	import type { FlattenedProduct } from '../../+page.server.js';
	export let tableModel: TableViewModel<FlattenedProduct>;
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
				invalidate('catalog:test-table');
			} else if (result.type === 'error') {
				toast.error('Replenish ERP Sync', {
					description: `Something is wrong ${result.error}`
				});
			}
			// use the default behavior for this result type
		};
	};

	const submitCenotekaSync: SubmitFunction = ({}) => {
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
					await invalidate('catalog:test-table');
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
	let formElErpSyncProd: HTMLFormElement;
	let formElExcel: HTMLFormElement;
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

		<!-- 		<DropdownMenu.Item
			on:click={() => {
				formElExcel.requestSubmit();
			}}
		>
			Export to Excel
		</DropdownMenu.Item> -->
		<form
			method="POST"
			action="/catalog?/getCenotekaInfo"
			use:enhance={submitCenotekaSync}
			bind:this={formElCenoteka}
		>
			<input type="hidden" name="ids" value={strSelectedDataIds} />
			<input type="hidden" name="source" value={2} />
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
			action="/catalog?/getCenotekaInfo"
			use:enhance={submitCenotekaSync}
			bind:this={formElIdea}
		>
			<input type="hidden" name="ids" value={strSelectedDataIds} />
			<input type="hidden" name="source" value={4} />
			<DropdownMenu.Item
				on:click={() => {
					formElIdea.requestSubmit();
				}}
			>
				Get Idea Info
			</DropdownMenu.Item>
		</form>
		<!-- <form
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
		</form> -->
	</DropdownMenu.Content>
</DropdownMenu.Root>
