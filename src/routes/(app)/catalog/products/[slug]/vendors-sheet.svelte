<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import type { МProductPoInsertSchemaАrray } from './schema';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import ComboboxField from '$lib/components/my/FormCombobox.svelte';

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
		formValidated = $bindable(),
		isSheetOpen = $bindable(false),
		selectedPurchaseId,
		selectedProductId,
		partners,
		isNew = false
	}: Props = $props();

	const form = superForm(formValidated, {
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

	const { form: formData, enhance: enhanceVendor } = form;

	if (!selectedPurchaseId) {
		$formData.purchases.push({
			c_bpartner_id: partners[0].value,
			m_product_id: selectedProductId,
			vendorproductno: ''
		});
	}

	let selectedVendor = $derived(
		$formData.purchases.findIndex(
			(p) => (p.id === undefined && selectedPurchaseId === undefined) || p.id === selectedPurchaseId
		)
	);
	let currentPurchase = $derived(selectedVendor >= 0 ? $formData.purchases[selectedVendor] : null);
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
					<ComboboxField
						{form}
						name="purchases"
						arrayIndex={selectedVendor}
						field="c_bpartner_id"
						label="Vendor"
						options={partners}
						width="w-full"
					/>

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
