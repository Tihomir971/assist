<script lang="ts">
	import { CheckboxZag, ComboboxZag, NumberInputZag } from '$lib/components/zag/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { dev } from '$app/environment';
	import type { ProductPackingInsertSchema } from './schema';
	import type { Tables } from '$lib/types/supabase.types';
	import { invalidate } from '$app/navigation';
	import { Label } from '$lib/components/ui/label';

	type Props = {
		isSheetOpen: boolean;
		validatedForm: SuperValidated<ProductPackingInsertSchema>;
		m_product_id: number;
		formProductPackingId: number | undefined;
		productPacking: Tables<'m_product_packing'>[];
	};

	let { isSheetOpen = $bindable(), validatedForm, m_product_id, productPacking }: Props = $props();
	let newBarcode = $state('');
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

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="sm:max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>Barcodes</Sheet.Title>
			<Sheet.Description>Manage product barcodes.</Sheet.Description>
		</Sheet.Header>
		<div class="flex flex-col gap-4 overflow-y-auto px-4">
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
			<!-- Edit/Create Form -->
			<div>
				<form method="POST" action="?/productPackingUpsert" use:enhanceGtin>
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

						<Form.Field form={superform} name="packing_type">
							<Form.Control>
								{#snippet children({ props })}
									<ComboboxZag
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
						<Form.Field form={superform} name="unitsperpack">
							<Form.Control>
								{#snippet children({ props })}
									<NumberInputZag
										{...props}
										label="Units Per Pack"
										bind:value={$formData.unitsperpack}
										fraction={0}
									/>
								{/snippet}
							</Form.Control>
						</Form.Field>

						<Form.Field form={superform} name="gtin">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>GTIN</Form.Label>
									<Input {...props} type="text" bind:value={$formData.gtin} placeholder="GTIN" />
								{/snippet}
							</Form.Control>
						</Form.Field>
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

					<div class="mt-4 flex flex-row-reverse gap-2">
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
			</div>
			<SuperDebug data={{ $formData, $errors }} display={dev} />
		</div>
	</Sheet.Content>
</Sheet.Root>
