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
	import { NumberInputZag, InputTextForm } from '$lib/components/my/input';
	import { ComboboxZagForm, SwitchZagForm } from '$lib/components/zag/index.js';
	import { mProductInsertSchema } from '$lib/types/supabase.zod.schemas';

	let { data } = $props();

	const productForm = superForm(data.formProduct, {
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
	} = productForm;

	let isProductPackingDrawerOpen: boolean = $state(false);
</script>

<div class="mx-auto w-full max-w-[var(--breakpoint-xl)]">
	<Card.Root class="mb-4">
		<form method="post" action="?/productUpsert" use:enhanceProductUpsert id="product-form">
			<Card.Header class="border-b border-surface-2 pb-6">
				<Card.Title class="flex w-full items-center justify-between">
					<div>
						<span>Product details</span>
						<span class="text-sm text-muted-foreground">
							ID: {$formProduct.id}
						</span>
					</div>
					<div class="flex items-center gap-2">
						<div>
							<div class={!isTaintedProduct($taintedProduct) ? 'hidden' : ''}>
								<Button type="submit">Save</Button>
								<Button type="button" variant="outline" onclick={() => productForm.reset()}>
									Reset
								</Button>
							</div>
							<div class={isTaintedProduct($taintedProduct) ? 'hidden' : ''}>
								<Form.Button name="delete" variant="destructive">Delete</Form.Button>
							</div>
						</div>
					</div>
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="mb-4 grid w-max grid-cols-3 gap-4">
					<SwitchZagForm superform={productForm} field="is_active" label="Is Active?" />
					<SwitchZagForm superform={productForm} field="is_self_service" label="Is Self Service?" />
					<SwitchZagForm superform={productForm} field="discontinued" label="Discontinued?" />
				</div>
				<InputTextForm
					superform={productForm}
					field="name"
					label="Product Name"
					placeholder="Enter Product name..."
				/>

				<div class="grid grid-cols-4 gap-4">
					<InputTextForm
						superform={productForm}
						field="sku"
						label="SKU"
						placeholder="Enter Product SKU..."
						readonly
					/>
					<InputTextForm
						superform={productForm}
						field="mpn"
						label="MPN"
						placeholder="Enter Product MPN..."
						autocomplete="off"
					/>

					<ComboboxZagForm
						superform={productForm}
						field="c_uom_id"
						label="UoM"
						items={data.uom}
						readonly={false}
					/>

					<ComboboxZagForm
						superform={productForm}
						field="c_taxcategory_id"
						label="Tax"
						items={data.tax}
					/>
				</div>
				<div class="grid grid-cols-1 divide-x *:px-3 md:grid-cols-[2fr_2fr_1fr]">
					<div>
						<h3 class="mb-2 pb-2 text-lg font-semibold">Basic Information</h3>

						<div class="grid grid-cols-2 gap-4"></div>

						<ComboboxZagForm
							superform={productForm}
							field="attributeset_id"
							label="Attribute Set"
							items={data.attributeSets}
						/>
						<ComboboxZagForm
							superform={productForm}
							field="m_product_category_id"
							label="Category"
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
								label="Net Quantity"
							/>
							<ComboboxZagForm
								superform={productForm}
								field="net_qty_uom_id"
								label="Net Quantity UoM"
								items={data.uom}
							/>

							<!-- <Form.Field form={productForm} name="net_qty_uom_id" class="w-full">
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
							</Form.Field> -->
						</div>
						<div class="grid grid-cols-2 gap-4">
							<Form.Field form={productForm} name="shelf_life">
								<Form.Control>
									{#snippet children({ props })}
										<NumberInputZag
											bind:value={$formProduct.shelf_life}
											fractions={0}
											{...props}
											label="Shelf Life (days)"
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
