<script lang="ts">
	import type { PageData } from './$types';
	import * as Table from '$lib/components/ui/table/index.js';
	import { findLabelByValue } from '$lib/scripts/objects';
	export let data: PageData;
</script>

{#if data.replenishes && data.product}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Warehouse</Table.Head>
				<Table.Head>Minimum</Table.Head>
				<Table.Head>Maximum</Table.Head>
				<Table.Head>Batch Size</Table.Head>
				<Table.Head>Source</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.replenishes as replenish}
				<Table.Row>
					<Table.Cell>
						{findLabelByValue(data.warehouses, replenish.m_warehouse_id)}
					</Table.Cell>
					<Table.Cell>{replenish.level_min}</Table.Cell>
					<Table.Cell>{replenish.level_max}</Table.Cell>
					<Table.Cell>{replenish.qtybatchsize ?? ''}</Table.Cell>
					<Table.Cell
						>{findLabelByValue(data.warehouses, replenish.m_warehousesource_id) ?? ''}</Table.Cell
					>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/if}
