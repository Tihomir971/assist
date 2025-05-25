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
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';

	import ProductPackingDrawer from './m-product-packing-drawer.svelte';
	import ChartVisualization from './ChartVisualization.svelte';
	import ProductPOCard from './m-product-po-card.svelte';
	import ReplenishCard from './m-replenish-card.svelte';
	import StorageOnHandCard from './m-storageonhand-card.svelte';
	import MyUrlInput from '$lib/components/my/input/input-url.svelte';
	import { InputTextForm } from '$lib/components/my/input';
	import { NumberInputZagForm, SwitchZagForm } from '$lib/components/zag/index.js';
	import { mProductInsertSchema } from '$lib/types/supabase.zod.schemas';
	import { page } from '$app/state';
	import { EnhancedCombobox } from '$lib/components/forms';

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
					<Button type="submit">Save</Button>
					<Button type="button" variant="outline" onclick={() => superform.reset()}>Reset</Button>
				</div>
				<Form.Button name="delete" variant="destructive">Delete</Form.Button>
				<Button variant="outline" href={`/catalog?${page.url.searchParams}`}>Back to List</Button>
			</div>
		</div>
		<div class="overflow-auto">
			<div class="overflow-auto">
				<Card.Root class="mb-4">
					<Card.Header class="border-b border-surface-2 pb-4">
						<InputTextForm
							{superform}
							field="name"
							label="Product Name"
							placeholder="Enter Product name..."
						/>
					</Card.Header>
					<Card.Content>
						<div class="mb-4 grid w-max grid-cols-3 gap-4">
							<SwitchZagForm {superform} field="is_active" label="Is Active?" />
							<SwitchZagForm {superform} field="is_self_service" label="Is Self Service?" />
							<SwitchZagForm {superform} field="discontinued" label="Discontinued?" />
						</div>

						<div class="grid grid-cols-4 gap-4">
							<InputTextForm
								{superform}
								field="sku"
								label="SKU"
								placeholder="Enter Product SKU..."
								readonly
							/>
							<InputTextForm
								{superform}
								field="mpn"
								label="MPN"
								placeholder="Enter Product MPN..."
								autocomplete="off"
							/>
							<Form.Field form={superform} name="c_uom_id">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Formula script New</Form.Label>
										<EnhancedCombobox
											{...props}
											bind:value={$formProduct.c_uom_id}
											items={data.uom}
										/>
									{/snippet}
								</Form.Control>
							</Form.Field>
							<Form.Field form={superform} name="c_taxcategory_id">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Tax</Form.Label>
										<EnhancedCombobox
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
								<h3 class="mb-2 pb-2 text-lg font-semibold">Basic Information</h3>
								<Form.Field form={superform} name="attributeset_id">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Attribute Set</Form.Label>
											<EnhancedCombobox
												{...props}
												bind:value={$formProduct.attributeset_id}
												items={data.attributeSets}
											/>
										{/snippet}
									</Form.Control>
								</Form.Field>
								<Form.Field form={superform} name="m_product_category_id">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Category</Form.Label>
											<EnhancedCombobox
												{...props}
												bind:value={$formProduct.m_product_category_id}
												items={data.categories}
											/>
										{/snippet}
									</Form.Control>
								</Form.Field>
							</div>
							<div>
								<h3 class="mb-2 pb-2 text-lg font-semibold">Packaging Information</h3>
								<div class="grid grid-cols-2 gap-4">
									<NumberInputZagForm
										{superform}
										field="net_quantity"
										fraction={4}
										label="Net Quantity"
									/>
									<Form.Field form={superform} name="net_qty_uom_id">
										<Form.Control>
											{#snippet children({ props })}
												<Form.Label>Net Quantity UoM</Form.Label>
												<EnhancedCombobox
													{...props}
													bind:value={$formProduct.net_qty_uom_id}
													items={data.uom}
												/>
											{/snippet}
										</Form.Control>
									</Form.Field>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<NumberInputZagForm
										{superform}
										field="shelf_life"
										fraction={0}
										label="Shelf Life (days)"
									/>

									<Form.Field form={superform} name="descriptionurl">
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
