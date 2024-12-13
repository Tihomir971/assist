<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { formatDate, formatDateTime, formatNumber } from '$lib/style/locale';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { MProductPoInsertSchema, МProductPoInsertSchemaАrray } from './schema';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import ArrowSquareOut from 'phosphor-svelte/lib/ArrowSquareOut';
	import CardVendorsSheet from './vendors-sheet.svelte';

	type Props = {
		form: SuperValidated<МProductPoInsertSchemaАrray>;
		productId: number;
		partners: {
			value: number;
			label: string;
		}[];
	};
	let data: Props = $props();

	function selectedPartnerLabel(value: number | null | undefined): string {
		if (value === null || value === undefined) return '';
		return data.partners?.find((v) => v.value === value)?.label ?? '';
	}

	let isSheetOpen = $state(false);
	let selectedPurchaseId: number | undefined = $state(undefined);
	let isNewPurchase = $state(false);

	function handleEllipsisClick(purchase: MProductPoInsertSchema) {
		selectedPurchaseId = purchase.id;
		isNewPurchase = false;
		isSheetOpen = !isSheetOpen;
	}

	function handleAddClick() {
		if (data.partners.length === 0) {
			toast.error('No partners available');
			return;
		}

		selectedPurchaseId = undefined;
		isNewPurchase = true;
		isSheetOpen = true;
	}
</script>

<Card.Root class="mb-4">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Vendors</Card.Title>
			<Button variant="outline" onclick={handleAddClick}>Add</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Partner</Table.Head>
					<Table.Head>vendorproductno</Table.Head>
					<Table.Head class="text-right">pricelist</Table.Head>
					<Table.Head class="text-right">From</Table.Head>
					<Table.Head class="text-right">To</Table.Head>
					<Table.Head>url</Table.Head>
					<Table.Head class="text-right">updated</Table.Head>
					<Table.Head></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.form.data.purchases as purchase}
					<Table.Row>
						<Table.Cell>
							{selectedPartnerLabel(purchase.c_bpartner_id)}
						</Table.Cell>
						<Table.Cell>{purchase.vendorproductno}</Table.Cell>
						<Table.Cell class="text-right">{formatNumber(purchase.pricelist)}</Table.Cell>
						<Table.Cell class="text-right">{formatDateTime(purchase.valid_from)}</Table.Cell>
						<Table.Cell class="text-right">{formatDateTime(purchase.valid_to)}</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								href={purchase.url}
								target="_blank"
								disabled={!purchase.url}><ArrowSquareOut size={32} /></Button
							>
						</Table.Cell>
						<Table.Cell class="text-right">{formatDateTime(purchase.updated as string)}</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => handleEllipsisClick(purchase)}
								class="-my-3"
							>
								<Ellipsis />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

{#if isSheetOpen}
	<CardVendorsSheet
		bind:isSheetOpen
		selectedProductId={data.productId}
		formValidated={data.form}
		{selectedPurchaseId}
		partners={data.partners}
		isNew={isNewPurchase}
	/>
{/if}
