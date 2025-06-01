<script lang="ts">
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ProductPackingInsertSchema } from './schema';
	import type { Tables } from '$lib/types/supabase.types';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import { isValidGTIN } from '$lib/scripts/gtin';
	import { invalidate } from '$app/navigation';
	import { CheckboxZag, Combobox, NumberInputZag } from '$lib/components/zag/index.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

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

	const superform = superForm(validatedForm, {
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
	const {
		form: formData,
		enhance: enhanceGtin,
		tainted,
		isTainted,
		delayed,
		formId,
		reset,
		errors
	} = superform;
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
									<CheckboxZag checked={packing.is_display} />
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
					<Form.Field form={superform} name="m_product_id">
						<Form.Control>
							{#snippet children({ props })}
								<NumberInputZag
									{...props}
									label="Product ID"
									bind:value={$formData.m_product_id}
									fraction={0}
									readOnly
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>

					<div>
						<Form.Field form={superform} name="packing_type">
							<Form.Control>
								{#snippet children({ props })}
									<Label>Packing Type</Label>
									<Combobox
										{...props}
										bind:value={$formData.packing_type}
										items={[
											{ value: 'Individual', label: 'Individual' },
											{ value: 'Pack', label: 'Pack' },
											{ value: 'Pallet', label: 'Pallet' }
										]}
										label="Packing Type"
										required
									/>
								{/snippet}
							</Form.Control>
						</Form.Field>
					</div>

					<div>
						<Form.Field form={superform} name="unitsperpack">
							<Form.Control>
								{#snippet children({ props })}
									<NumberInputZag
										{...props}
										label="Units Per Pack"
										bind:value={$formData.unitsperpack}
										fraction={0}
										readOnly
									/>
								{/snippet}
							</Form.Control>
						</Form.Field>
					</div>

					<div class="space-y-2">
						<label for="gtin" class="font-medium">GTIN</label>
						<Input id="gtin" type="text" bind:value={$formData.gtin} placeholder="GTIN" />
					</div>
					<Form.Field form={superform} name="is_display">
						<Form.Control>
							{#snippet children({ props })}
								<CheckboxZag
									{...props}
									bind:checked={$formData.is_display}
									label="Is display box?"
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>
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
				<SuperDebug data={{ $formData, $errors }} />
			</form>
		</div>

		<Drawer.Footer>
			<Drawer.Close>Close</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
