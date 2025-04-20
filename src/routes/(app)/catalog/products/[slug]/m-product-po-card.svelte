<script lang="ts">
	import { formatDateTime, formatNumber } from '$lib/style/locale';
	import { type SuperValidated } from 'sveltekit-superforms';
	import type { MProductPoFormSchema } from './schema';

	import { toast } from 'svelte-sonner';
	// UI Elements
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	// Icons
	import PhDotsThreeBold from '~icons/ph/dots-three-bold';
	import PhArrowSquareOut from '~icons/ph/arrow-square-out';
	// Components
	import ProductPoSheet from './m-product-po-sheet.svelte';
	let isProductPoSheetOpen = $state(false);

	type Props = {
		form: SuperValidated<MProductPoFormSchema>;
		productId: number;
		data: MProductPoFormSchema[];
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

	let selectedPurchaseId: number | undefined = $state(undefined);

	function handleAddClick() {
		if (data.partners.length === 0) {
			toast.error('No partners available');
			return;
		}
		selectedPurchaseId = undefined;
		isProductPoSheetOpen = true;
	}
	let selectedVendor = $derived.by(() => {
		return data.data.find((v) => v.id === selectedPurchaseId);
	});
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
				{#each data.data as purchases}
					<Table.Row>
						<Table.Cell>
							{selectedPartnerLabel(purchases.c_bpartner_id)}
						</Table.Cell>
						<!-- <Table.Cell>
							{selectedPartnerLabel($form.purchases[i].c_bpartner_id)}
						</Table.Cell> -->
						<Table.Cell>{purchases.vendorproductno}</Table.Cell>
						<Table.Cell class="text-right">{formatNumber(purchases.pricelist)}</Table.Cell>
						<Table.Cell class="text-right">{formatDateTime(purchases.valid_from)}</Table.Cell>
						<Table.Cell class="text-right">{formatDateTime(purchases.valid_to)}</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								href={purchases.url}
								target="_blank"
								disabled={!purchases.url}><PhArrowSquareOut /></Button
							>
						</Table.Cell>
						<Table.Cell class="text-right"
							>{formatDateTime(purchases.updated_at as string)}</Table.Cell
						>
						<!-- onclick={() => handleEllipsisClick($form.purchases[i])} -->
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => {
									selectedPurchaseId = purchases.id;
									isProductPoSheetOpen = !isProductPoSheetOpen;
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

{#if isProductPoSheetOpen}
	<ProductPoSheet
		bind:isSheetOpen={isProductPoSheetOpen}
		data={selectedVendor}
		form={data.form}
		partners={data.partners}
	/>
{/if}
