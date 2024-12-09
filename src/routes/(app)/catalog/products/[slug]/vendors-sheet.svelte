<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import type {
		CrudMProductPoRowSchema,
		MProductPoInsertSchema,
		МProductPoInsertSchemaАrray
	} from './schema';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label';
	import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';

	type Props = {
		formValidated: SuperValidated<МProductPoInsertSchemaАrray>;
		isSheetOpen: boolean;
		selectedPurchaseId: number | undefined;
		selectedProductId: number;
		partners: {
			value: number;
			label: string;
		}[];
		isNew?: boolean;
	};

	let {
		formValidated,
		isSheetOpen = $bindable(false),
		selectedPurchaseId,
		selectedProductId,
		partners,
		isNew = false
	}: Props = $props();

	const {
		form: formData,
		enhance: enhanceVendor,
		tainted,
		isTainted
	} = superForm(formValidated, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Vendor operation successful');
				invalidate('catalog:products');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Vendor operation failed');
			}
		}
	});

	if (!selectedPurchaseId) {
		$formData.purchases.push({
			c_bpartner_id: partners[0].value,
			m_product_id: selectedProductId,
			vendorproductno: ''
		});
	}
	let partnersWithStringValues = $derived(
		partners.map((partner) => ({
			value: partner.value.toString(),
			label: partner.label
		}))
	);

	// Initialize new purchase immediately
	//	$effect(() => {
	//		if (isNew && isSheetOpen && !selectedPurchaseId && partners.length > 0) {
	//			$formData.purchases = [
	//				...$formData.purchases,
	//				{
	//					id: undefined,
	//					m_product_id: selectedProductId,
	//					c_bpartner_id: partners[0].value,
	//					vendorproductno: '',
	//					pricelist: 0,
	//					barcode: null,
	//					url: null,
	//					isactive: true,
	//					iscurrentvendor: false
	//				}
	//			];
	//		}
	//	});

	let selectedVendor = $derived(
		$formData.purchases.findIndex(
			(p) => (p.id === undefined && selectedPurchaseId === undefined) || p.id === selectedPurchaseId
		)
	);
	$inspect('selectedVendor', selectedVendor);
	let currentPurchase = $derived(selectedVendor >= 0 ? $formData.purchases[selectedVendor] : null);

	const triggerContent = $derived(
		currentPurchase
			? (partnersWithStringValues.find((p) => p.value === currentPurchase.c_bpartner_id.toString())
					?.label ?? 'Select partner')
			: 'Select partner'
	);
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>{isNew ? 'Add Vendor' : 'Edit Vendor'}</Sheet.Title>
			<Sheet.Description>
				{isNew ? 'Add new vendor information here.' : 'Make changes to vendor information here.'} Click
				save when you're done.
			</Sheet.Description>
		</Sheet.Header>
		<form method="post" use:enhanceVendor action="?/vendors" class="grid gap-4 py-4">
			{#if currentPurchase}
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="partner">Partner</Label>
						<Select.Root
							type="single"
							value={currentPurchase.c_bpartner_id.toString()}
							onValueChange={(v) => {
								if (selectedVendor >= 0) {
									$formData.purchases[selectedVendor].c_bpartner_id = Number.parseInt(v);
								}
							}}
						>
							<Select.Trigger id="partner" class="w-full">
								{triggerContent}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each partnersWithStringValues as partner (partner.value)}
										<Select.Item value={partner.value} label={partner.label}>
											{partner.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>

					<div class="grid gap-2">
						<Label for="vendor-product-no">Vendor Product Number</Label>
						<Input
							id="vendor-product-no"
							type="text"
							placeholder="Vendor Product Number"
							bind:value={$formData.purchases[selectedVendor].vendorproductno}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="price-list">Price List</Label>
						<Input
							id="price-list"
							type="number"
							min="0"
							step="0.01"
							bind:value={$formData.purchases[selectedVendor].pricelist}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="vendor-url">URL</Label>
						<Input
							id="vendor-url"
							type="url"
							placeholder="URL"
							bind:value={$formData.purchases[selectedVendor].url}
						/>
					</div>
				</div>
				<div class="h-80 overflow-auto">
					<SuperDebug data={$formData} />
				</div>
			{/if}
			<Sheet.Footer>
				<Form.Button>Save changes</Form.Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
