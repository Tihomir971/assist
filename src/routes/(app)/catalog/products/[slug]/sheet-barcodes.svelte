<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import type { CrudMProductGtinSchema, МProductPoInsertSchemaАrray } from './schema';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import ComboboxField from '$lib/components/my/MyComboboxForm.svelte';

	type Props = {
		formValidated: SuperValidated<CrudMProductGtinSchema>;
		isBarcodeDrawerOpen: boolean;
		selectedPackageId: number | undefined;
		selectedProductId: number;
		packageTypes: {
			value: number;
			label: string;
		}[];
		isNew?: boolean;
	};

	let {
		formValidated = $bindable(),
		isBarcodeDrawerOpen = $bindable(false),
		selectedPackageId,
		selectedProductId,
		packageTypes,
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

	const { form: formData, enhance } = form;

	if (!selectedPackageId) {
		$formData.productPacking.push({
			m_product_packing_type_id: packageTypes[0].value,
			m_product_id: selectedProductId,
			gtin: ''
		});
	}

	let selectedPackage = $derived(
		$formData.productPacking.findIndex(
			(p) => (p.id === undefined && selectedPackageId === undefined) || p.id === selectedPackageId
		)
	);
	let currentPurchase = $derived(
		selectedPackage >= 0 ? $formData.productPacking[selectedPackage] : null
	);
</script>

<Sheet.Root bind:open={isBarcodeDrawerOpen}>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>{isNew ? 'Add Vendor' : 'Edit Vendor'}</Sheet.Title>
			<Sheet.Description>
				{isNew ? 'Add new vendor information here.' : 'Make changes to vendor information here.'} Click
				save when you're done.
			</Sheet.Description>
		</Sheet.Header>
		<form method="post" use:enhance action="?/vendors" class="grid gap-4 py-4">
			{#if currentPurchase}
				<div class="grid gap-4">
					<ComboboxField
						{form}
						name="purchases"
						arrayIndex={selectedPackage}
						field="m_product_packing_type_id"
						label="Package Type"
						options={packageTypes}
						width="w-full"
					/>

					<div class="grid gap-2">
						<Label for="vendor-product-no">Vendor Product Number</Label>
						<Input
							id="vendor-product-no"
							type="text"
							placeholder="Vendor Product Number"
							bind:value={$formData.productPacking[selectedPackage].gtin}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="price-list">Price List</Label>
						<Input
							id="price-list"
							type="number"
							min="0"
							step="0.01"
							bind:value={$formData.productPacking[selectedPackage].unitsperpack}
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
