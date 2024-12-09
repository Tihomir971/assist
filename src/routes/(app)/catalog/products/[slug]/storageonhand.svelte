<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { MStorageonhandInsertSchemaАrray } from './schema';
	import * as Table from '$lib/components/ui/table/index.js';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';

	interface Props {
		form: SuperValidated<MStorageonhandInsertSchemaАrray>;
		productId: number;
		//replenishes: CrudReplenishSchema[];
		warehouses: Array<{ value: number; label: string }>;
	}

	let data: Props = $props();

	const { form, enhance, tainted, isTainted, allErrors } = superForm(data.form, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
				invalidate('catalog:products');
			}
		}
	});
	function selectedWarehouseLabel(value: number | null | undefined): string {
		if (value === null || value === undefined) return '';
		return data.warehouses?.find((v) => v.value === value)?.label ?? '';
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Warehouse</Table.Head>
			<Table.Head class="text-right">Quantity</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each $form.storageonhand as storageonhand}
			<Table.Row>
				<Table.Cell class="font-medium"
					>{selectedWarehouseLabel(storageonhand.warehouse_id)}</Table.Cell
				>
				<Table.Cell class="text-right">{storageonhand.qtyonhand}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
