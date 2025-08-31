<script lang="ts">
	import type { Tables } from '$lib/types/supabase';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	type Props = {
		storageOnHand: Pick<Tables<'m_storageonhand'>, 'warehouse_id' | 'qtyonhand'>[];
		warehouses: Array<{ value: number; label: string }>;
	};

	let { storageOnHand, warehouses }: Props = $props();

	function getWarehouseName(id: number | null) {
		if (!id) return 'N/A';
		return warehouses.find((w) => w.value === id)?.label ?? 'Unknown Warehouse';
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Stock On Hand</Card.Title>
		<Card.Description>Current inventory levels across all warehouses.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Warehouse</Table.Head>
					<Table.Head class="text-right">Quantity</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each storageOnHand as stock}
					<Table.Row>
						<Table.Cell>{getWarehouseName(stock.warehouse_id)}</Table.Cell>
						<Table.Cell class="text-right">{stock.qtyonhand}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
