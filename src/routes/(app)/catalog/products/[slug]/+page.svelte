<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { zodClient } from 'sveltekit-superforms/adapters';
	// Icons
	import PhDotsThree from '~icons/ph/dots-three';
	import PhPackage from '~icons/ph/package';
	import PhArrowSquareOut from '~icons/ph/arrow-square-out';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';

	import DrawerBarcodes from './drawer-barcodes.svelte';
	import ChartVisualization from './ChartVisualization.svelte';
	import VendorsCard from './vendors.svelte';
	import ReplenishCard from './replenish.svelte';
	import StorageOnHandCard from './storageonhand.svelte';
	import { crudMProductSchema } from './schema';
	import FormCombobox from '$lib/components/my/MyComboboxForm.svelte';

	let { data } = $props();

	const productForm = superForm(data.formProduct, {
		validators: zodClient(crudMProductSchema),
		onUpdated(event) {
			const { form } = event;
			if (form.valid) {
				toast.success('Product updated successfully', {
					description: form.message || 'Your changes have been saved.'
				});

				invalidate('catalog:products');
			} else {
				toast.error('Failed to update product', {
					description: form.message || 'Please check the form for errors'
				});
			}
		},
		dataType: 'json'
	});
	const {
		form: formProduct,
		enhance: enhanceProduct,
		tainted: productTainted,
		isTainted: isProductTainted
	} = productForm;

	function handleNetQuantityInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = parseFloat(input.value);
		if (!isNaN(value)) {
			$formProduct.net_quantity = value;
		}
	}

	let isBarcodeDrawerOpen: boolean = $state(false);

	let selectedUomLabel = $derived(
		data.uom.find((v) => v.value === $formProduct.c_uom_id?.toString())?.label
	);
	let selectedTaxLabel = $derived(
		data.tax?.find((v) => v.value === $formProduct.c_taxcategory_id?.toString())?.label
	);

	let selectedNetQtyUom = $derived(
		data.uom?.find((v) => v.value === $formProduct.net_qty_uom_id?.toString())?.label
	);
</script>

<div class="mx-auto w-full max-w-[var(--breakpoint-xl)]">
	<Card.Root class="mb-4">
		<form method="post" action="?/product" use:enhanceProduct id="product-form">
			<Card.Header class="border-b">
				<Card.Description class="text-lg">Product ID: {$formProduct.id}</Card.Description>
				<div class="grid grid-cols-[1fr_auto] gap-2">
					<div>
						<Card.Title class="flex items-center gap-2">
							<PhPackage class="mb-2 size-8" />
							<Form.Field form={productForm} name="name">
								<Form.Control>
									{#snippet children({ props })}
										<Input
											{...props}
											placeholder="Enter Product name..."
											class="min-w-4xl text-2xl"
											bind:value={$formProduct.name}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</Card.Title>
					</div>
					<div class="mb-2">
						<div class={!isProductTainted($productTainted) ? 'hidden' : ''}>
							<Button type="submit">Save</Button>
							<Button type="button" variant="outline" onclick={() => productForm.reset()}
								>Reset</Button
							>
						</div>
						<div class={isProductTainted($productTainted) ? 'hidden' : ''}>
							<Form.Button name="delete" variant="destructive">Delete</Form.Button>
						</div>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="mb-4 flex flex-wrap gap-4">
					<div class="mb-4 flex flex-wrap gap-4">
						<Badge
							variant={$formProduct.isactive ? 'default' : 'outline'}
							onclick={() => {
								$formProduct.isactive = !$formProduct.isactive;
							}}
						>
							{$formProduct.isactive ? 'Active' : 'Inactive'}
						</Badge>
						<Badge
							variant={$formProduct.isselfservice ? 'default' : 'outline'}
							onclick={() => {
								$formProduct.isselfservice = !$formProduct.isselfservice;
							}}
						>
							{$formProduct.isselfservice ? 'Self Service' : 'Not Self Service'}
						</Badge>
						<Badge
							variant={$formProduct.discontinued ? 'default' : 'outline'}
							onclick={() => {
								$formProduct.discontinued = !$formProduct.discontinued;
							}}
						>
							{$formProduct.discontinued ? 'Discontinued' : 'Not Discontinued'}
						</Badge>
					</div>
				</div>
				<div class="grid grid-cols-1 divide-x *:px-3 md:grid-cols-[2fr_2fr_1fr]">
					<div>
						<h3 class="mb-2 pb-2 text-lg font-semibold">Basic Information</h3>
						<div class="grid grid-cols-2 gap-4">
							<Form.Field form={productForm} name="sku">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>SKU</Form.Label>
										<Input {...props} bind:value={$formProduct.sku} readonly />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={productForm} name="mpn">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>MPN</Form.Label>
										<Input {...props} autocomplete="off" bind:value={$formProduct.mpn} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<Form.Field form={productForm} name="c_uom_id">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>UoM</Form.Label>
										<Select.Root
											type="single"
											value={$formProduct.c_uom_id?.toString()}
											name={props.name}
											onValueChange={(v) => {
												$formProduct.c_uom_id = Number.parseInt(v);
											}}
										>
											<Select.Trigger {...props}>
												{selectedUomLabel}
											</Select.Trigger>
											<Select.Content>
												{#if data.uom}
													{#each data.uom as v}
														<Select.Item value={v.value} label={v.label} />
													{/each}
												{/if}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field form={productForm} name="c_taxcategory_id">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Tax</Form.Label>
										<Select.Root
											type="single"
											value={$formProduct.c_taxcategory_id?.toString()}
											name={props.name}
											onValueChange={(v) => {
												$formProduct.c_taxcategory_id = Number.parseInt(v);
											}}
										>
											<Select.Trigger {...props}>
												{selectedTaxLabel}
											</Select.Trigger>
											<Select.Content>
												{#if data.tax}
													{#each data.tax as v}
														<Select.Item value={v.value} label={v.label} />
													{/each}
												{/if}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>

						<FormCombobox
							form={productForm}
							name="m_product_category_id"
							label="Category"
							options={data.categories}
							width="w-full"
						/>
					</div>
					<div>
						<h3 class="mb-2 pb-2 text-lg font-semibold">Packaging Information</h3>
						<div class="grid grid-cols-2 gap-4">
							<Form.Field form={productForm} name="unitsperpack">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Units Per Pack</Form.Label>
										<Input
											type="number"
											min="1"
											bind:value={$formProduct.unitsperpack}
											{...props}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={productForm} name="unitsperpallet">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Units Per Pallet</Form.Label>
										<Input
											type="number"
											bind:value={$formProduct.unitsperpallet}
											{...props}
											min="1"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<Form.Field form={productForm} name="net_quantity">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Net Quantity</Form.Label>
										<Input
											type="number"
											step="0.0001"
											bind:value={$formProduct.net_quantity}
											oninput={handleNetQuantityInput}
											{...props}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={productForm} name="net_qty_uom_id" class="w-full">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Net Quantity UoM</Form.Label>
										<Select.Root
											type="single"
											value={$formProduct.net_qty_uom_id?.toString()}
											name={props.name}
											onValueChange={(v) => {
												$formProduct.net_qty_uom_id = Number.parseInt(v);
											}}
										>
											<Select.Trigger {...props}>
												{selectedNetQtyUom}
											</Select.Trigger>
											<Select.Content>
												{#if data.uom}
													{#each data.uom as v}
														<Select.Item value={v.value} label={v.label} />
													{/each}
												{/if}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<Form.Field form={productForm} name="shelf_life">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Shelf Life (days)</Form.Label>
										<Input type="number" bind:value={$formProduct.shelf_life} {...props} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={productForm} name="descriptionurl">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Manufacturer URL</Form.Label>
										<div class="flex">
											<Input type="url" bind:value={$formProduct.descriptionurl} {...props} />
											<Button
												variant="link"
												size="icon"
												href={$formProduct.descriptionurl}
												target="_blank"
												disabled={!$formProduct.descriptionurl}
												class="rounded-l-none"
											>
												<PhArrowSquareOut />
											</Button>
										</div>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
					</div>
					<div>
						<div class="flex items-center justify-between">
							<h3 class="mb-2 flex items-center gap-2 text-lg font-semibold">
								<PhPackage /> Barcodes
							</h3>
							<Button variant="ghost" size="icon" onclick={() => (isBarcodeDrawerOpen = true)}>
								<PhDotsThree />
							</Button>
						</div>
						<Table.Root class="w-full">
							<Table.Header>
								<Table.Row>
									<Table.Head>Package</Table.Head>
									<Table.Head>Qty.</Table.Head>
									<Table.Head>Barcode</Table.Head>
									<Table.Head></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.formProductPacking.data.productPacking as barcode}
									<Table.Row>
										<Table.Cell>
											{data.productPackingType.find(
												(v) => v.value === barcode.m_product_packing_type_id
											)?.label}
										</Table.Cell>
										<Table.Cell>{barcode.unitsperpack}</Table.Cell>
										<Table.Cell>{barcode.gtin}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				</div>
			</Card.Content>
		</form>
	</Card.Root>
	<!-- Vendors -->
	{#if $formProduct.id}
		<VendorsCard form={data.formPurchasing} partners={data.partners} productId={data.productId} />

		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title>Stock</Card.Title>
			</Card.Header>
			<Card.Content>
				<StorageOnHandCard
					form={data.formStorageOnHand}
					productId={data.productId}
					warehouses={data.warehouses}
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title>Replenish</Card.Title>
				<Card.Description>Manage warehouse replenishment rules</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if $formProduct.id}
					<ReplenishCard
						form={data.formReplenish}
						warehouses={data.warehouses}
						productId={$formProduct.id}
					/>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title>Sales Chart</Card.Title>
				<Card.Description>Monthly Sales Comparison</Card.Description>
			</Card.Header>
			<Card.Content>
				<ChartVisualization data={data.salesByWeeks} />
			</Card.Content>
		</Card.Root>

		<DrawerBarcodes
			bind:isBarcodeDrawerOpen
			validatedForm={data.formProductPacking}
			m_product_id={$formProduct.id}
			formProductPackingId={undefined}
		/>
	{/if}
</div>
