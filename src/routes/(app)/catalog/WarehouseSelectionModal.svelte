<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';

	export let show = false;
	let warehouses: { id: number; name: string }[] = [];
	let selectedWarehouse: any = undefined;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handleSubmit() {
		if (selectedWarehouse) {
			dispatch('select', { warehouseId: selectedWarehouse.value });
			close();
		}
	}

	function handleSelect(value: any) {
		selectedWarehouse = value;
	}

	onMount(() => {
		const handleWarehouseSelect = (event: CustomEvent) => {
			warehouses = event.detail.warehouses;
		};

		window.addEventListener('warehouseSelect', handleWarehouseSelect as EventListener);

		return () => {
			window.removeEventListener('warehouseSelect', handleWarehouseSelect as EventListener);
		};
	});
</script>

<Dialog.Root open={show} onOpenChange={close}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Select Warehouse</Dialog.Title>
		</Dialog.Header>
		<form on:submit|preventDefault={handleSubmit} use:enhance>
			<div class="grid gap-4 py-4">
				<Select.Root selected={selectedWarehouse} onSelectedChange={handleSelect as any}>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a warehouse" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Warehouses</Select.Label>
							{#each warehouses as warehouse}
								<Select.Item value={warehouse.id.toString()}>
									{warehouse.name}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={!selectedWarehouse}>Generate Report</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
