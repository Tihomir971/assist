<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { isValidGTIN } from '$lib/scripts/gtin';
	import { invalidate } from '$app/navigation';
	import type { ProductPackingInsertSchema } from './schema';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import MySelectForm from '$lib/components/my/MySelectForm.svelte';
	import MyCheckboxForm from '$lib/components/my/MyCheckboxForm.svelte';
	import { NumberInputZag } from '$lib/components/my/input';
	import type { Tables } from '$lib/types/supabase.types';

	type Props = {
		isProductPackingDrawerOpen: boolean;
		validatedForm: SuperValidated<ProductPackingInsertSchema>;
		m_product_id: number;
		formProductPackingId: number | undefined;
		productPacking: Tables<'m_product_packing'>[];
	};

	let {
		isProductPackingDrawerOpen = $bindable(),
		validatedForm,
		m_product_id,
		productPacking
	}: Props = $props();
	//let data: Props = $props();
	let newBarcode = $state('');
	let isValidBarcode = $derived(newBarcode === '' || isValidGTIN(newBarcode));

	const {
		form: formData,
		enhance: enhanceGtin,
		tainted,
		isTainted,
		delayed,
		formId,
		reset,
		errors
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
	// let isDuplicatedBarcode = $derived($formData.productPacking.some((b) => b.gtin === newBarcode));
	let editingId: number | null = $state(null);
</script>

<Drawer.Root bind:open={isProductPackingDrawerOpen} dismissible={true} direction="right">
	<Drawer.Content class="inset-x-auto inset-y-0 right-0 mt-0 w-1/3">
		<Drawer.Header>
			<Drawer.Title>Barcodes</Drawer.Title>
			<Drawer.Description>Manage product barcodes</Drawer.Description>
		</Drawer.Header>
		<div class="container mx-auto overflow-y-auto p-4">
			<div class="rounded-md border">
				<Table.Root class="min-w-full">
					<Table.Header>
						<Table.Row>
							<Table.Head>Packing Type</Table.Head>
							<Table.Head>Units Per Pack</Table.Head>
							<Table.Head>GTIN</Table.Head>
							<Table.Head>Display</Table.Head>
							<Table.Head>Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each productPacking ?? [] as packing}
							<Table.Row>
								<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.packing_type}</Table.Cell>
								<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.unitsperpack}</Table.Cell>
								<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.gtin}</Table.Cell>
								<Table.Cell class="px-6 py-4 whitespace-nowrap">
									<MyCheckboxForm checked={packing.is_display} />
								</Table.Cell>
								<Table.Cell class="space-x-2 px-6 py-4 whitespace-nowrap">
									<Button
										variant="outline"
										disabled={$delayed}
										onclick={() => {
											editingId = packing.id;
											$formData = packing;
										}}
									>
										Edit
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<!-- Edit/Create Form -->
			<form
				method="POST"
				action="?/productPackingUpsert"
				use:enhanceGtin
				class="mt-8 max-w-xl space-y-4"
			>
				{#if editingId}
					<input type="hidden" name="id" bind:value={$formData.id} />
				{/if}

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<NumberInputZag
							bind:value={$formData.m_product_id}
							label="Product ID"
							fractions={0}
							required
							readonly
						/>
					</div>
					<div class="space-y-2">
						<label for="packing_type" class="text-sm font-medium">Packing Type</label>
						<MySelectForm
							name="packing_type"
							bind:value={$formData.packing_type}
							options={[
								{ value: 'Individual', label: 'Individual' },
								{ value: 'Pack', label: 'Pack' },
								{ value: 'Pallet', label: 'Pallet' }
							]}
						/>
					</div>

					<div class="space-y-2">
						<NumberInputZag
							name="unitsperpack"
							bind:value={$formData.unitsperpack}
							label="Units Per Pack"
						/>
					</div>

					<div class="space-y-2">
						<label for="gtin" class="text-sm font-medium">GTIN</label>
						<Input id="gtin" type="text" bind:value={$formData.gtin} placeholder="GTIN" />
					</div>
					<MyCheckboxForm
						name="is_display"
						bind:checked={$formData.is_display}
						label="Is display box?"
					/>
				</div>

				<div class="flex gap-2">
					<Button type="submit" disabled={$delayed}>
						{#if $delayed}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{editingId ? 'Update' : 'Create'} Packing
					</Button>

					{#if editingId}
						<Button
							variant="outline"
							type="button"
							disabled={$delayed}
							onclick={() => {
								editingId = null;
								reset();
							}}
						>
							Cancel
						</Button>
					{/if}
					{#if $formData.id}
						<Button
							type="submit"
							formaction="?/productPackingDelete"
							variant="destructive"
							disabled={$delayed}
							onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}
						>
							{#if $delayed}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
							{:else}
								Delete
							{/if}
						</Button>
					{/if}
				</div>
			</form>
			<SuperDebug data={{ $formData, $errors }} />
		</div>

		<Drawer.Footer>
			<Drawer.Close>Close</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
