<script lang="ts">
	import { formatDateTime, formatNumber } from '$lib/style/locale';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { MProductPoInsertSchema, МProductPoInsertSchemaАrray } from './schema';
	import { toast } from 'svelte-sonner';
	// UI Elements
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	// Icons
	import PhDotsThreeBold from '~icons/ph/dots-three-bold';
	import PhArrowSquareOut from '~icons/ph/arrow-square-out';
	// Components
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
	const { form, errors } = superForm(data.form, {
		dataType: 'json',
		warnings: {
			duplicateId: false
		}
	});

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
				<!-- {#each data.form.data.purchases as purchase} -->
				{#each $form.purchases as _, i}
					<Table.Row>
						<Table.Cell>
							{selectedPartnerLabel($form.purchases[i].c_bpartner_id)}
						</Table.Cell>
						<!-- <Table.Cell>
							{selectedPartnerLabel($form.purchases[i].c_bpartner_id)}
						</Table.Cell> -->
						<Table.Cell>{$form.purchases[i].vendorproductno}</Table.Cell>
						<Table.Cell class="text-right">{formatNumber($form.purchases[i].pricelist)}</Table.Cell>
						<Table.Cell class="text-right"
							>{formatDateTime($form.purchases[i].valid_from)}</Table.Cell
						>
						<Table.Cell class="text-right">{formatDateTime($form.purchases[i].valid_to)}</Table.Cell
						>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								href={$form.purchases[i].url}
								target="_blank"
								disabled={!$form.purchases[i].url}><PhArrowSquareOut /></Button
							>
						</Table.Cell>
						<Table.Cell class="text-right"
							>{formatDateTime($form.purchases[i].updated_at as string)}</Table.Cell
						>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => handleEllipsisClick($form.purchases[i])}
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
	<CardVendorsSheet
		bind:isSheetOpen
		selectedProductId={data.productId}
		formValidated={data.form}
		{selectedPurchaseId}
		partners={data.partners}
		isNew={isNewPurchase}
	/>
{/if}
