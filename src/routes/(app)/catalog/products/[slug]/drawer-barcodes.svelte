<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { schemaProductGtinID, type ProductGtinSchema } from '../zod.validator';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import Package from 'lucide-svelte/icons/package';
	import Trash from 'lucide-svelte/icons/trash-2';

	type Props = {
		isBarcodeDrawerOpen: boolean;
		formData: SuperValidated<ProductGtinSchema>;
		barcodes: ProductGtinSchema[];
		m_product_id: number;
	};

	let { isBarcodeDrawerOpen = $bindable(), formData, barcodes, m_product_id }: Props = $props();

	let newBarcode = $state('');

	const { enhance: enhanceBarcode, formId: formIdBarcode } = superForm(formData, {
		validators: zodClient(schemaProductGtinID),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Barcode operation successful');
				newBarcode = ''; // Reset input after successful submission
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Barcode operation failed');
			}
		}
	});

	function handleDeleteBarcode(gtinToDelete: string) {
		// Remove the barcode from the list
		barcodes = barcodes.filter((barcode) => barcode.gtin !== gtinToDelete);

		// You might want to add additional logic here to update the server
		// This could involve calling an action or method to remove the barcode
	}

	function handleAddBarcode() {
		if (!newBarcode) return;

		// Basic validation - you might want to add more robust validation
		if (barcodes.some((b) => b.gtin === newBarcode)) {
			toast.error('Barcode already exists');
			return;
		}

		// Add the new barcode with required properties
		barcodes = [
			...barcodes,
			{
				gtin: newBarcode,
				m_product_id,
				isactive: true
			}
		];
		newBarcode = ''; // Reset input
	}

	// Type guard to ensure barcode has an id
	function hasBarcodeId(barcode: ProductGtinSchema): barcode is ProductGtinSchema & { id: number } {
		return barcode.id !== undefined;
	}
</script>

<Drawer.Root
	open={isBarcodeDrawerOpen}
	dismissible={false}
	onOpenChange={(open) => (isBarcodeDrawerOpen = open)}
	direction="right"
>
	<form method="POST" use:enhanceBarcode>
		<Drawer.Content class="0 inset-x-auto inset-y-0 right-0 mt-0 w-96">
			<Drawer.Header>
				<Drawer.Title>Barcodes</Drawer.Title>
				<Drawer.Description>Manage product barcodes</Drawer.Description>
			</Drawer.Header>
			<div class="space-y-4 p-4">
				<ul class="list-inside space-y-2">
					{#each barcodes as barcode (barcode.gtin)}
						{#if hasBarcodeId(barcode)}
							<li class="flex items-center justify-between gap-2">
								<div class="flex items-center gap-2">
									<Package class="h-4 w-4" />
									{barcode.gtin}
								</div>
								<Button
									variant="destructive"
									type="submit"
									size="default"
									formaction="?/gtinDEL"
									value={barcode.id}
									onclick={() => ($formIdBarcode = barcode.id.toString())}
								>
									<Trash class="h-4 w-4" />
								</Button>
							</li>
						{/if}
					{/each}
				</ul>

				<div class="flex gap-2">
					<Input placeholder="Enter new barcode" bind:value={newBarcode} class="flex-grow" />
					<Button onclick={handleAddBarcode}>Add</Button>
				</div>
			</div>

			<Drawer.Footer>
				<Button type="submit" form={$formIdBarcode}>Save Changes</Button>
				<Drawer.Close>Close</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</form>
</Drawer.Root>
