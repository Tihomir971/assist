<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { zodClient } from 'sveltekit-superforms/adapters';
	// Icons
	import PhDotsThree from '~icons/ph/dots-three';
	import PhPackage from '~icons/ph/package';

	import * as Tabs from '$lib/components/ui/tabs/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';

	import ProductPackingDrawer from './m-product-packing-drawer.svelte';
	import ChartVisualization from './ChartVisualization.svelte';
	import ProductPOCard from './m-product-po-card.svelte';
	import ReplenishCard from './m-replenish-card.svelte';
	import StorageOnHandCard from './m-storageonhand-card.svelte';
	import { crudMProductSchema } from './schema';
	import MyUrlInput from '$lib/components/my/input/input-url.svelte';
	import { ComboboxZag, MyTextInput, NumberInputZag } from '$lib/components/my/input';

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
				console.error('Failed to update product', {
					description: form.errors || 'Please check the form for errors'
				});
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

	let isProductPackingDrawerOpen: boolean = $state(false);

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
			<Card.Header class="border-b border-surface-2 pb-6">
				<Card.Title class="mb-2 flex items-center justify-between">
					<div>Product details</div>
					<p class="text-sm text-muted-foreground">
						ID: {$formProduct.id}
					</p>
				</Card.Title>
				<div class="grid w-full grid-cols-[1fr_auto] items-center gap-2">
					<MyTextInput
						placeholder="Enter Product name..."
						labelText="Product Name"
						bind:value={$formProduct.name}
						inline
						required
					/>
					<div>
						<div class={!isProductTainted($productTainted) ? 'hidden' : ''}>
							<Button type="submit">Save</Button>
							<Button type="button" variant="outline" onclick={() => productForm.reset()}>
								Reset
							</Button>
						</div>
						<div class={isProductTainted($productTainted) ? 'hidden' : ''}>
							<Form.Button name="delete" variant="destructive">Delete</Form.Button>
						</div>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="mb-4 flex flex-wrap gap-4">
					<Badge
						variant={$formProduct.is_active ? 'default' : 'outline'}
						onclick={() => {
							$formProduct.is_active = !$formProduct.is_active;
						}}
					>
						{$formProduct.is_active ? 'Active' : 'Inactive'}
					</Badge>
					<Badge
						variant={$formProduct.is_self_service ? 'default' : 'outline'}
						onclick={() => {
							$formProduct.is_self_service = !$formProduct.is_self_service;
						}}
					>
						{$formProduct.is_self_service ? 'Self Service' : 'Not Self Service'}
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
				<div class="grid grid-cols-4 gap-4">
					<Form.Field form={productForm} name="sku">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>SKU</Form.Label>
								<MyTextInput {...props} bind:value={$formProduct.sku} readonly />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={productForm} name="mpn">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>MPN</Form.Label>
								<MyTextInput {...props} autocomplete="off" bind:value={$formProduct.mpn} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
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
				<div class="grid grid-cols-1 divide-x *:px-3 md:grid-cols-[2fr_2fr_1fr]">
					<div>
						<h3 class="mb-2 pb-2 text-lg font-semibold">Basic Information</h3>

						<div class="grid grid-cols-2 gap-4"></div>

						<ComboboxZag
							name="attributeset_id"
							bind:value={$formProduct.attributeset_id}
							labelText="Attribute Set"
							items={data.attributeSets}
						/>
						<ComboboxZag
							name="m_product_category_id"
							bind:value={$formProduct.m_product_category_id}
							labelText="Category"
							items={data.categories}
						/>
					</div>
					<div>
						<h3 class="mb-2 pb-2 text-lg font-semibold">Packaging Information</h3>

						<div class="grid grid-cols-2 gap-4">
							<NumberInputZag
								name="net_quantity"
								bind:value={$formProduct.net_quantity}
								fractions={4}
								labelText="Net Quantity"
							/>
							<!-- 	<Form.Field form={productForm} name="net_quantity">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Net Quantity</Form.Label>
										<MyNumberInput
											step={0.0001}
											bind:value={$formProduct.net_quantity}
											{...props}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field> -->
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
										<NumberInputZag
											bind:value={$formProduct.shelf_life}
											fractions={0}
											{...props}
											labelText="Shelf Life (days)"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={productForm} name="descriptionurl">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Manufacturer URL</Form.Label>
										<MyUrlInput bind:value={$formProduct.descriptionurl} {...props} />
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
							<Button
								variant="ghost"
								size="icon"
								onclick={() => (isProductPackingDrawerOpen = true)}
							>
								<PhDotsThree />
							</Button>
						</div>
						<Table.Root class="w-full">
							<Table.Header>
								<Table.Row class="border-surface-2">
									<Table.Head>Package</Table.Head>
									<Table.Head>Qty.</Table.Head>
									<Table.Head>Barcode</Table.Head>
									<Table.Head></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.productPacking as barcode}
									<Table.Row>
										<Table.Cell>{barcode.packing_type}</Table.Cell>
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
		<Tabs.Root value="vendors" class="w-full">
			<Tabs.List class="grid w-full grid-cols-4">
				<Tabs.Trigger value="vendors">Vendors</Tabs.Trigger>
				<Tabs.Trigger value="stock">Stock</Tabs.Trigger>
				<Tabs.Trigger value="replenish">Replenish</Tabs.Trigger>
				<Tabs.Trigger value="sales-chart">Sales Chart</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="vendors">
				<ProductPOCard
					form={data.formProductPo}
					partners={data.partners}
					productId={data.productId}
					data={data.purchases}
				/>
			</Tabs.Content>
			<Tabs.Content value="stock">
				<Card.Root>
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
			</Tabs.Content>
			<Tabs.Content value="replenish">
				<Card.Root>
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
			</Tabs.Content>
			<Tabs.Content value="sales-chart">
				<Card.Root>
					<Card.Header>
						<Card.Title>Sales Chart</Card.Title>
						<Card.Description>Monthly Sales Comparison</Card.Description>
					</Card.Header>
					<Card.Content>
						<ChartVisualization data={data.salesByWeeks} />
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>

		<ProductPackingDrawer
			bind:isProductPackingDrawerOpen
			productPacking={data.productPacking}
			validatedForm={data.formProductPacking}
			m_product_id={data.productId}
			formProductPackingId={undefined}
		/>
	{/if}
</div>
