<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Form from '$lib/components/ui/form/index.js';

	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import PhPackage from '~icons/ph/package';
	import PhTrash from '~icons/ph/trash';
	import { isValidGTIN } from '$lib/scripts/gtin';
	import type { CrudMProductGtinSchema } from './schema';
	import { invalidate } from '$app/navigation';

	type Props = {
		isBarcodeDrawerOpen: boolean;
		validatedForm: SuperValidated<CrudMProductGtinSchema>;
		m_product_id: number;
	};

	let { isBarcodeDrawerOpen = $bindable(), validatedForm, m_product_id }: Props = $props();
	//let data: Props = $props();
	let newBarcode = $state('');
	let isValidBarcode = $derived(newBarcode === '' || isValidGTIN(newBarcode));

	const {
		form: formGtin,
		enhance: enhanceGtin,
		tainted,
		isTainted
	} = superForm(validatedForm, {
		dataType: 'json',
		//validators: zodClient(crudGtinSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Barcode operation successful');
				newBarcode = ''; // Reset input after successful submission

				invalidate('catalog:products');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Barcode operation failed');
			}
		}
	});
	let isDuplicatedBarcode = $derived($formGtin.productPacking.some((b) => b.gtin === newBarcode));

	function handleAddBarcode() {
		if (!isValidBarcode) {
			return;
		}
		// Basic validation - you might want to add more robust validation
		if ($formGtin.productPacking.some((b) => b.gtin === newBarcode)) {
			toast.error('Barcode already exists');
			return;
		}

		// Add the new barcode with required properties
		$formGtin.productPacking.push({
			m_product_id: m_product_id,
			gtin: newBarcode,
			m_product_packing_type_id: 1
		});
		$formGtin.productPacking = $formGtin.productPacking;
		newBarcode = ''; // Reset input
	}
	$inspect('isBarcodeDrawerOpen', isBarcodeDrawerOpen);
</script>

<Drawer.Root bind:open={isBarcodeDrawerOpen} dismissible={true} direction="right">
	<Drawer.Content class="inset-x-auto inset-y-0 right-0 mt-0 w-96">
		<Drawer.Header>
			<Drawer.Title>Barcodes</Drawer.Title>
			<Drawer.Description>Manage product barcodes</Drawer.Description>
		</Drawer.Header>
		<form method="POST" use:enhanceGtin action="?/gtinUPD">
			<div class="space-y-4 p-4">
				<ul class="list-inside space-y-2">
					{#each $formGtin.productPacking as barcode (barcode.gtin)}
						<li class="flex items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								<PhPackage />
								{barcode.m_product_packing_type_id}
							</div>
							<div class="flex items-center gap-2">
								{barcode.gtin}
							</div>
							<Button
								variant="destructive"
								type="submit"
								size="default"
								formaction="?/gtinDEL"
								value={barcode.id}
							>
								<PhTrash />
							</Button>
						</li>
					{/each}
				</ul>

				<div class="flex gap-2">
					<Input
						type="text"
						placeholder="Enter new barcode"
						bind:value={newBarcode}
						class="flex-grow"
					/>
					<Button disabled={newBarcode === ''} onclick={handleAddBarcode}>Add</Button>
				</div>
				{#if !isValidBarcode}
					<p class="w-full text-center text-red-500">Invalid Barcode</p>
				{/if}
				{#if isDuplicatedBarcode}
					<p class="w-full text-center text-red-500">Duplicated Barcode</p>
				{/if}
				<Form.Button disabled={!isTainted($tainted)}>Save</Form.Button>
			</div>
		</form>
		<SuperDebug data={$formGtin} />
		<Drawer.Footer>
			<Drawer.Close>Close</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
