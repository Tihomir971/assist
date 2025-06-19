<script lang="ts">
	import { type SuperValidated } from 'sveltekit-superforms';
	// UI Elements
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import Sheet from './m-replenish-sheet.svelte';
	import * as Table from '$lib/components/ui/table';
	import PhDotsThreeBold from '~icons/ph/dots-three-bold';
	import { getLabelByValue } from '$lib/scripts/custom';
	import type { MReplenishInsert } from '$lib/types/supabase.zod.schemas.d';

	interface Props {
		validatedForm: SuperValidated<MReplenishInsert>;
		productId: number;
		data: MReplenishInsert[];
		warehouses: Array<{ value: number; label: string }>;
	}

	let { validatedForm, productId, data, warehouses }: Props = $props();

	let isSheetOpen = $state(false);
	let selectedId: number | undefined = $state();
	let selected = $derived.by(() => {
		return data.find((v) => v.id === selectedId);
	});
</script>

<Card.Root class="mb-4">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Replenish</Card.Title>
			<Button
				variant="outline"
				onclick={() => {
					selectedId = undefined;
					isSheetOpen = true;
				}}
				>Add
			</Button>
		</div>
		<Card.Description>Manage warehouse replenishment rules</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-1/5">Warehouse</Table.Head>
					<Table.Head class="w-1/5">Source Warehouse</Table.Head>
					<Table.Head class="w-1/5 text-right">Min Level</Table.Head>
					<Table.Head class="w-1/5 text-right">Max Level</Table.Head>
					<Table.Head class="w-1/5 text-right">Batch Size</Table.Head>
					<Table.Head></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data as row}
					<Table.Row>
						<Table.Cell>
							{getLabelByValue(row.m_warehouse_id, warehouses)}
						</Table.Cell>
						<Table.Cell>
							{getLabelByValue(row.m_warehousesource_id, warehouses)}
						</Table.Cell>
						<Table.Cell class="text-right">{row.level_min}</Table.Cell>
						<Table.Cell class="text-right">{row.level_max}</Table.Cell>
						<Table.Cell class="text-right">{row.qtybatchsize}</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => {
									selectedId = row.id;
									isSheetOpen = !isSheetOpen;
								}}
								class="-my-3"
							>
								<PhDotsThreeBold />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

{#if isSheetOpen}
	<Sheet bind:isSheetOpen bind:data={selected} {validatedForm} {warehouses} />
{/if}
