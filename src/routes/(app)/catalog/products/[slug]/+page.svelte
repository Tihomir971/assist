<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { zodClient } from 'sveltekit-superforms/adapters';
	// Icons
	import PhDotsThree from '~icons/ph/dots-three';
	import PhPackage from '~icons/ph/package';

	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import ProductPackingDrawer from './m-product-packing-drawer.svelte';
	import ProductPackingSheet from './m-product-packing-sheet.svelte';
	import ChartVisualization from './ChartVisualization.svelte';
	import ProductPOCard from './m-product-po-card.svelte';
	import ReplenishCard from './m-replenish-card.svelte';
	import StorageOnHandCard from './m-storageonhand-card.svelte';
	import { ComboboxZag, NumberInputZag, SwitchZag } from '$lib/components/zag/index.js';
	import { mProductInsertSchema } from '$lib/types/supabase.zod.schemas';
	import { page } from '$app/state';

	let { data } = $props();

	const superform = superForm(data.formProduct, {
		validators: zodClient(mProductInsertSchema),
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
		enhance: enhanceProductUpsert,
		tainted: taintedProduct,
		isTainted: isTaintedProduct
	} = superform;

	let isProductPackingDrawerOpen: boolean = $state(false);
	let isSheetOpenProductPacking: boolean = $state(false);
</script>

<div class="mx-auto w-full max-w-[var(--breakpoint-xl)]">
	<form method="post" action="?/productUpsert" use:enhanceProductUpsert id="product-form">
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Edit product</h1>
				<p class="text-muted-foreground">Update attribute group details</p>
			</div>
			<div class="flex items-center gap-2">
				<div class={!isTaintedProduct($taintedProduct) ? 'hidden' : ''}>
					<Form.Button>Save</Form.Button>
					<Button variant="outline" onclick={() => superform.reset()}>Reset</Button>
				</div>
				<Form.Button name="delete" variant="destructive">Delete</Form.Button>
				<Button variant="link" href={`/catalog?${page.url.searchParams}`}>Back to List</Button>
			</div>
		</div>
		<div class="overflow-auto">
			<div class="overflow-auto">
				<Card.Root class="mb-4">
					<Card.Header class="border-surface-2 border-b pb-4">
						<Form.Field form={superform} name="name">
							<Form.Control>
								{#snippet children({ props })}
									<Label>Product Name</Label>
									<Input {...props} bind:value={$formProduct.name} placeholder="Product name..." />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<div class="grid w-max grid-cols-3 gap-4">
							<Form.Field form={superform} name="is_active">
								<Form.Control>
									{#snippet children({ props })}
										<SwitchZag
											{...props}
											bind:checked={$formProduct.is_active}
											label="Is Active?"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={superform} name="is_self_service">
								<Form.Control>
									{#snippet children({ props })}
										<SwitchZag
											{...props}
											bind:checked={$formProduct.is_self_service}
											label="Is Self Service?"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={superform} name="discontinued">
								<Form.Control>
									{#snippet children({ props })}
										<SwitchZag
											{...props}
											bind:checked={$formProduct.discontinued}
											label="Discontinued?"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>

						<div class="grid grid-cols-4 gap-4">
							<Form.Field form={superform} name="sku">
								<Form.Control>
									{#snippet children({ props })}
										<Label>SKU</Label>
										<Input
											{...props}
											bind:value={$formProduct.sku}
											placeholder="Product SKU..."
											readonly
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={superform} name="mpn">
								<Form.Control>
									{#snippet children({ props })}
										<Label>MPN</Label>
										<Input
											{...props}
											bind:value={$formProduct.mpn}
											placeholder="Product MPN..."
											autocomplete="off"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<div class="flex flex-col gap-4">
								<Label>Formula script New</Label>
								<input value={data.priceFormula?.name} />
							</div>
							<Form.Field form={superform} name="c_taxcategory_id">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Tax</Form.Label>
										<ComboboxZag
											{...props}
											bind:value={$formProduct.c_taxcategory_id}
											items={data.tax}
										/>
									{/snippet}
								</Form.Control>
							</Form.Field>
						</div>
						<div class="grid grid-cols-1 divide-x *:px-3 md:grid-cols-[2fr_2fr_1fr]">
							<div>
								<h3 class="mb-4 text-lg font-semibold">Basic Information</h3>
								<div class="flex flex-col gap-4">
									<Form.Field form={superform} name="attributeset_id">
										<Form.Control>
											{#snippet children({ props })}
												<ComboboxZag
													{...props}
													bind:value={$formProduct.attributeset_id}
													items={data.attributeSets}
													label="Attribute Set"
												/>
											{/snippet}
										</Form.Control>
									</Form.Field>
									<Form.Field form={superform} name="m_product_category_id">
										<Form.Control>
											{#snippet children({ props })}
												<ComboboxZag
													{...props}
													bind:value={$formProduct.m_product_category_id}
													items={data.categories}
													label="Product Category"
												/>
											{/snippet}
										</Form.Control>
									</Form.Field>
								</div>
							</div>
							<div class="flex flex-col gap-4">
								<h3 class="text-lg font-semibold">Packaging Information</h3>
								<div class="flex flex-col gap-4">
									<div class="grid grid-cols-2 gap-4">
										<Form.Field form={superform} name="net_quantity">
											<Form.Control>
												{#snippet children({ props })}
													<NumberInputZag
														{...props}
														label="Net Quantity New"
														bind:value={$formProduct.net_quantity}
														fraction={4}
													/>
												{/snippet}
											</Form.Control>
										</Form.Field>

										<Form.Field form={superform} name="net_qty_uom_id">
											<Form.Control>
												{#snippet children({ props })}
													<ComboboxZag
														{...props}
														bind:value={$formProduct.net_qty_uom_id}
														items={data.uom}
														label="Net Quantity UOM"
													/>
												{/snippet}
											</Form.Control>
										</Form.Field>
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<Form.Field form={superform} name="shelf_life">
										<Form.Control>
											{#snippet children({ props })}
												<NumberInputZag
													{...props}
													label="Shelf Life (days)"
													bind:value={$formProduct.shelf_life}
													fraction={0}
												/>
											{/snippet}
										</Form.Control>
									</Form.Field>

									<Form.Field form={superform} name="descriptionurl">
										<Form.Control>
											{#snippet children({ props })}
												<Form.Label>Manufacturer URL</Form.Label>
												<Input type="url" {...props} bind:value={$formProduct.descriptionurl} />
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
										onclick={() => (isSheetOpenProductPacking = true)}
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
				</Card.Root>
			</div>
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
							validatedForm={data.formProductPo}
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
						<ReplenishCard
							validatedForm={data.formReplenish}
							data={data.replenishes}
							warehouses={data.warehouses}
							productId={$formProduct.id}
						/>
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
			{/if}
		</div>
	</form>
</div>

<ProductPackingDrawer
	bind:isProductPackingDrawerOpen
	productPacking={data.productPacking}
	validatedForm={data.formProductPacking}
	m_product_id={data.productId}
	formProductPackingId={undefined}
/>
{#if isSheetOpenProductPacking}
	<ProductPackingSheet
		bind:isSheetOpen={isSheetOpenProductPacking}
		productPacking={data.productPacking}
		validatedForm={data.formProductPacking}
		m_product_id={data.productId}
		formProductPackingId={undefined}
	/>
{/if}
