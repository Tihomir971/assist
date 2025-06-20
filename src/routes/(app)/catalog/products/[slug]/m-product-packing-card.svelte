<script lang="ts">
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ProductPackingInsertSchema } from './schema';
	import type { Tables } from '$lib/types/supabase.types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ProductPackingSheet from './m-product-packing-sheet.svelte';

	type Props = {
		productPacking: Tables<'m_product_packing'>[];
		validatedForm: SuperValidated<ProductPackingInsertSchema>;
		m_product_id: number;
	};

	let { productPacking, validatedForm, m_product_id }: Props = $props();
	let isSheetOpenProductPacking = $state(false);
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Barcodes</Card.Title>
			<Button variant="outline" onclick={() => (isSheetOpenProductPacking = true)}>Manage</Button>
		</div>
		<Card.Description
			>Manage product barcodes (GTINs) for different packaging types.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<Table.Root class="w-full">
			<Table.Header>
				<Table.Row class="border-surface-2">
					<Table.Head>Package</Table.Head>
					<Table.Head>Qty.</Table.Head>
					<Table.Head>Barcode</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each productPacking as barcode}
					<Table.Row>
						<Table.Cell>{barcode.packing_type}</Table.Cell>
						<Table.Cell>{barcode.unitsperpack}</Table.Cell>
						<Table.Cell>{barcode.gtin}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

{#if isSheetOpenProductPacking}
	<ProductPackingSheet
		bind:isSheetOpen={isSheetOpenProductPacking}
		{productPacking}
		{validatedForm}
		{m_product_id}
		formProductPackingId={undefined}
	/>
{/if}
