<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import type { LayoutData } from './$types';
	import { convertToTreeStructure } from '$lib/scripts/tree';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { TreeView } from '$lib/components/treeview';
	import PhNotePencil from 'phosphor-svelte/lib/NotePencil';
	import PhFolderPlus from 'phosphor-svelte/lib/FolderPlus';
	import PhFolderMinus from 'phosphor-svelte/lib/FolderMinus';
	import PhArrowsInLineVertical from 'phosphor-svelte/lib/ArrowsInLineVertical';
	import PhPrinter from 'phosphor-svelte/lib/Printer';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import WarehouseSelectionModal from './WarehouseSelectionModal.svelte';

	export let data: LayoutData;

	$: treeItems = convertToTreeStructure(data.categories);

	function rerunLoadFunction(id: string | null) {
		if (!id) return;
		const newUrl = new URL($page.url);

		if (id) {
			newUrl?.searchParams?.set('cat', id);
		} else {
			newUrl?.searchParams?.delete('cat');
		}

		if (browser) {
			goto(newUrl);
		}
		return;
	}
	let selected: HTMLElement | null | undefined;

	function editCategory() {
		console.log('editCategory');

		if (selected) {
			goto('/catalog/category/' + selected.getAttribute('data-id'));
		}

		return;
	}

	let activeCategory = selected?.getAttribute('data-id') || null;
	$: if (selected && activeCategory !== selected?.getAttribute('data-id')) {
		activeCategory = selected?.getAttribute('data-id');
		rerunLoadFunction(activeCategory);
	}

	let showModal = false;

	async function handleWarehouseSelect() {
		if (!activeCategory) {
			console.error('No active category selected');
			return;
		}

		const { data: warehouses, error } = await data.supabase
			.from('m_warehouse')
			.select('id, name')
			.order('name');

		if (error) {
			console.error('Error fetching warehouses:', error);
			return;
		}

		showModal = true;

		// Pass the fetched warehouses to the WarehouseSelectionModal
		if (warehouses) {
			const warehouseSelectEvent = new CustomEvent('warehouseSelect', {
				detail: { warehouses }
			});
			window.dispatchEvent(warehouseSelectEvent);
		}
	}

	function onWarehouseSelected(event: CustomEvent<{ warehouseId: string }>) {
		const { warehouseId } = event.detail;
		if (activeCategory) {
			goto(`/catalog/report?warehouse=${warehouseId}&treeCategory=${activeCategory}`);
		} else {
			console.error('No active category selected');
		}
	}
</script>

<div class="flex h-full w-full gap-2 overflow-hidden">
	<Card.Root class="grid h-full w-72 grid-rows-[auto_1fr] overflow-hidden">
		<Card.Header class="border-b p-3">
			<Card.Title>
				<div class="flex items-center gap-2">
					<Tooltip.Root openDelay={0} group>
						<Tooltip.Trigger id="edit_tooltip" asChild let:builder>
							<Button builders={[builder]} variant="ghost" size="icon" on:click={editCategory}>
								<PhNotePencil size="24" />
								<span class="sr-only">Edit</span>
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom">Edit</Tooltip.Content>
					</Tooltip.Root>
					<Tooltip.Root openDelay={0} group>
						<Tooltip.Trigger id="create_tooltip" asChild let:builder>
							<Button builders={[builder]} variant="ghost" size="icon">
								<PhFolderPlus size="24" />
								<span class="sr-only">Create Category</span>
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom">Create Category</Tooltip.Content>
					</Tooltip.Root>
					<form method="post" use:enhance action="/catalog?/deleteCategory">
						<input
							type="number"
							name="id"
							value={Number(selected?.getAttribute('data-id'))}
							hidden
						/>

						<Tooltip.Root openDelay={0} group>
							<Tooltip.Trigger id="delete_tooltip" asChild let:builder>
								<Form.Button builders={[builder]} variant="ghost" size="icon">
									<PhFolderMinus size="24" />
									<span class="sr-only">Delete Category</span>
								</Form.Button>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom">{activeCategory}Delete Category</Tooltip.Content>
						</Tooltip.Root>
					</form>
					<Tooltip.Root openDelay={0} group>
						<Tooltip.Trigger id="collaps_tooltip" asChild let:builder>
							<Button builders={[builder]} variant="ghost" size="icon">
								<PhArrowsInLineVertical size="24" />
								<span class="sr-only">Collaps Tree</span>
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom">Collaps Tree</Tooltip.Content>
					</Tooltip.Root>
					<Tooltip.Root openDelay={0} group>
						<Tooltip.Trigger id="report_tooltip" asChild let:builder>
							<Button
								builders={[builder]}
								variant="ghost"
								size="icon"
								on:click={handleWarehouseSelect}
							>
								<span class="sr-only">Generate Report</span>
								<PhPrinter size="24" />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom">Generate Report</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</Card.Title>
		</Card.Header>
		<Card.Content class="h-full overflow-hidden px-1">
			<div class="h-full w-full overflow-y-auto">
				<TreeView bind:treeItems expanded={data.expanded} bind:selected />
			</div>
		</Card.Content>
	</Card.Root>

	<slot />
</div>

<WarehouseSelectionModal
	show={showModal}
	on:close={() => (showModal = false)}
	on:select={onWarehouseSelected}
/>
