<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Form from '$lib/components/ui/form/index.js';

	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import Package from 'lucide-svelte/icons/package';
	import Trash from 'lucide-svelte/icons/trash-2';
	import Plus from 'lucide-svelte/icons/plus';
	import { crudGtinSchema, type CrudGtinSchema } from '../zod.validator';
	import { isValidGTIN } from '$lib/scripts/gtin';

	type Props = {
		isBarcodeDrawerOpen: boolean;
		validatedForm: SuperValidated<Infer<CrudGtinSchema>>;
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
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Barcode operation failed');
			}
		}
	});
	let isDuplicatedBarcode = $derived($formGtin.barcodes.some((b) => b.gtin === newBarcode));

	function handleAddBarcode() {
		if (!isValidBarcode) {
			return;
		}
		// Basic validation - you might want to add more robust validation
		if ($formGtin.barcodes.some((b) => b.gtin === newBarcode)) {
			toast.error('Barcode already exists');
			return;
		}

		// Add the new barcode with required properties
		$formGtin.barcodes.push({ id: undefined, m_product_id: m_product_id, gtin: newBarcode });
		$formGtin.barcodes = $formGtin.barcodes;
		newBarcode = ''; // Reset input
	}
</script>

<Drawer.Root
	bind:open={isBarcodeDrawerOpen}
	dismissible={false}
	onOpenChange={(open) => (isBarcodeDrawerOpen = open)}
	direction="right"
>
	<form method="POST" use:enhanceGtin action="?/gtinUPD">
		<Drawer.Content class="0 inset-x-auto inset-y-0 right-0 mt-0 w-96">
			<Drawer.Header>
				<Drawer.Title>Barcodes</Drawer.Title>
				<Drawer.Description>Manage product barcodes</Drawer.Description>
			</Drawer.Header>
			<div class="space-y-4 p-4">
				<ul class="list-inside space-y-2">
					{#each $formGtin.barcodes as barcode (barcode.gtin)}
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
							>
								<Trash class="h-4 w-4" />
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
			<SuperDebug data={$formGtin} />
			<Drawer.Footer>
				<Drawer.Close>Close</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</form>
</Drawer.Root>
