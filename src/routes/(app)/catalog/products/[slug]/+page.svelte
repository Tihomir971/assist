<script lang="ts">
	import { invalidate } from '$app/navigation';

	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import SuperDebug, { type SuperValidated } from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { formatDateTime, formatNumber } from '$lib/style/locale';
	import * as Form from '$lib/components/ui/form';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { browser } from '$app/environment';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { crudmProductPoSchema } from '$lib/types/supabase/mProductPo.validator';
	import * as Tabs from '$lib/components/ui/tabs';
	import X from 'lucide-svelte/icons/x';
	let { data } = $props();
	import { crudMProductSchema } from '$lib/types/supabase/product.validator';

	/* $effect(() => {
		toast.success(JSON.stringify(data.barcodes));
	}); */

	import Combobox2 from '$lib/components/melt/ComboBox2.svelte';
	import { crudProductGtinSchema, replenishSchema } from '../zod.validator.js';
	async function deleteProductPORow(rowToBeDeleted: number) {
		const { error } = await data.supabase.from('m_product_po').delete().eq('id', rowToBeDeleted);
		if (error) throw error;
		return;
	}

	const form = superForm(data.formProduct, {
		validators: zodClient(crudMProductSchema),
		onUpdated(event) {
			const { form } = event;
			if (form.valid) {
				toast.success('Product updated successfully', {
					description: form.message || 'Your changes have been saved.'
				});

				// Invalidate the page to refresh all data

				invalidate('catalog:product');
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
	} = form;

	const formPPO = superForm(data.formProductPO, {
		validators: zodClient(crudmProductPoSchema),
		onUpdated({ form }) {
			console.log('Form updated', form); // Add this line for debugging
			if (form.valid) {
				toast.success('Product added successfully', {
					description: form.message
				});
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to add product', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form: formProductPO, enhance: enhanceProductPO } = formPPO;

	const formGtin = superForm(data.formProductGtin, {
		validators: zodClient(crudProductGtinSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Barcode operation successful');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Barcode operation failed');
			}
		}
	});
	const { form: formProductGtin, enhance: enhanceProductGtin } = formGtin;

	const formReplenish = superForm(data.formReplenish, {
		validators: zodClient(replenishSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to update replenish data', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const {
		form: formProductReplenish,
		enhance: enhanceReplenish,
		formId: formIdReplenish
	} = formReplenish;

	let selectedWarehouse = $derived(
		$formProductReplenish.m_warehouse_id
			? data.warehouses?.find((v) => v.value === $formProductReplenish.m_warehouse_id)
			: undefined
	);

	let selectedSourceWarehouse = $derived(
		$formProductReplenish.m_warehousesource_id
			? data.warehouses?.find((v) => v.value === $formProductReplenish.m_warehousesource_id)
			: undefined
	);

	let selectedUoM = $derived(
		$formProduct.c_uom_id ? data.uom?.find((v) => v.value === $formProduct.c_uom_id) : undefined
	);
	let selectedTax = $derived(
		$formProduct.c_taxcategory_id
			? data.tax?.find((v) => v.value === $formProduct.c_taxcategory_id)
			: undefined
	);

	let selectedVendor = $derived(
		$formProductPO.c_bpartner_id
			? data.c_bpartner?.find((v) => v.value === $formProductPO.c_bpartner_id)
			: undefined
	);
	function getWarehouseName(id: number) {
		return data.warehouses.find((w) => w.value === id)?.label || 'Unknown';
	}

	function handleNetQuantityInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = parseFloat(input.value);
		if (!isNaN(value)) {
			$formProduct.net_quantity = value;
		}
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-3xl font-bold">Product Management</h1>
	<Tabs.Root value="info" class="w-full">
		<Tabs.List class="mb-4">
			<Tabs.Trigger value="info">Product Info</Tabs.Trigger>
			<Tabs.Trigger value="vendors">Vendors</Tabs.Trigger>
			<Tabs.Trigger value="barcodes">Barcodes</Tabs.Trigger>
			<Tabs.Trigger value="replenish">Replenish</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="info">
			<form method="POST" action="?/updateProduct" use:enhanceProduct id="product-form">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card.Root class="md:col-span-2">
						<Card.Header>
							<Card.Title>Product Information</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="space-y-4">
								<Form.Field {form} name="name">
									<Form.Control let:attrs>
										<Form.Label>Name</Form.Label>
										<Input {...attrs} autocomplete="off" bind:value={$formProduct.name} />
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
								<div class="grid grid-cols-3 gap-3">
									<Form.Field {form} name="c_uom_id">
										<Form.Control let:attrs>
											<Form.Label>UoM</Form.Label>
											<Select.Root
												selected={selectedUoM}
												onSelectedChange={(v) => {
													v && ($formProduct.c_uom_id = v.value);
												}}
											>
												<Select.Trigger {...attrs}>
													<Select.Value placeholder="Select UoM" />
												</Select.Trigger>
												<Select.Content>
													{#if data.uom}
														{#each data.uom as v}
															<Select.Item value={v.value} label={v.label} />
														{/each}
													{/if}
												</Select.Content>
											</Select.Root>
											<input hidden bind:value={$formProduct.c_uom_id} name={attrs.name} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<Form.Field {form} name="c_taxcategory_id">
										<Form.Control let:attrs>
											<Form.Label>Tax</Form.Label>
											<Select.Root
												selected={selectedTax}
												onSelectedChange={(v) => {
													v && ($formProduct.c_taxcategory_id = v.value);
												}}
											>
												<Select.Trigger {...attrs}>
													<Select.Value placeholder="Select Tax" />
												</Select.Trigger>
												<Select.Content>
													{#if data.tax}
														{#each data.tax as v}
															<Select.Item value={v.value} label={v.label} />
														{/each}
													{/if}
												</Select.Content>
											</Select.Root>
											<input hidden bind:value={$formProduct.c_taxcategory_id} name={attrs.name} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<Form.Field {form} name="m_product_category_id">
										<Form.Control let:attrs>
											<Form.Label>Category</Form.Label>
											<Combobox2
												{...attrs}
												options={data.categories}
												bind:value={$formProduct.m_product_category_id}
											/>
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								</div>
								<div class="grid grid-cols-3 gap-3">
									<Form.Field {form} name="unitsperpack">
										<Form.Control let:attrs>
											<Form.Label>Units Per Pack</Form.Label>
											<Input
												type="number"
												min="1"
												bind:value={$formProduct.unitsperpack}
												{...attrs}
											/>
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<Form.Field {form} name="unitsperpallet">
										<Form.Control let:attrs>
											<Form.Label>Units Per Pallet</Form.Label>
											<Input type="number" bind:value={$formProduct.unitsperpallet} {...attrs} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<Form.Field {form} name="descriptionurl">
										<Form.Control let:attrs>
											<Form.Label>Manufacturer URL</Form.Label>
											<Input type="url" bind:value={$formProduct.descriptionurl} {...attrs} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								</div>
								<div class="grid grid-cols-2 gap-3">
									<Form.Field {form} name="net_quantity">
										<Form.Control let:attrs>
											<Form.Label>Net Quantity</Form.Label>
											<Input
												type="number"
												step="0.001"
												bind:value={$formProduct.net_quantity}
												on:input={handleNetQuantityInput}
												{...attrs}
											/>
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<Form.Field {form} name="net_qty_uom_id">
										<Form.Control let:attrs>
											<Form.Label>Net Quantity UoM</Form.Label>
											<Select.Root
												selected={data.uom?.find((v) => v.value === $formProduct.net_qty_uom_id)}
												onSelectedChange={(v) => {
													v && ($formProduct.net_qty_uom_id = v.value);
												}}
											>
												<Select.Trigger {...attrs}>
													<Select.Value placeholder="Select Net Quantity UoM" />
												</Select.Trigger>
												<Select.Content>
													{#if data.uom}
														{#each data.uom as v}
															<Select.Item value={v.value} label={v.label} />
														{/each}
													{/if}
												</Select.Content>
											</Select.Root>
											<input hidden bind:value={$formProduct.net_qty_uom_id} name={attrs.name} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								</div>
								<Form.Field {form} name="mpn">
									<Form.Control let:attrs>
										<Form.Label>Manufacturer Part Number (MPN)</Form.Label>
										<Input {...attrs} autocomplete="off" bind:value={$formProduct.mpn} />
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</div>
						</Card.Content>
					</Card.Root>

					<div class="space-y-6">
						<Card.Root>
							<Card.Header>
								<Card.Title>Identification</Card.Title>
							</Card.Header>
							<Card.Content>
								<div class="space-y-2">
									<Form.Field {form} name="id">
										<Form.Control let:attrs>
											<div class="grid grid-cols-[1fr_2fr] items-center">
												<Form.Label>ID</Form.Label>
												<Input {...attrs} bind:value={$formProduct.id} readonly />
											</div>
										</Form.Control>
									</Form.Field>
									<Form.Field {form} name="sku">
										<Form.Control let:attrs>
											<div class="grid grid-cols-[1fr_2fr] items-center">
												<Form.Label>SKU</Form.Label>
												<Input {...attrs} bind:value={$formProduct.sku} readonly />
											</div>
										</Form.Control>
									</Form.Field>
								</div>
							</Card.Content>
						</Card.Root>

						<Card.Root>
							<Card.Header>
								<Card.Title>Statuses</Card.Title>
							</Card.Header>
							<Card.Content>
								<div class="space-y-2">
									<Form.Field {form} name="isactive">
										<Form.Control let:attrs>
											<div class="flex items-center space-x-2">
												<Checkbox {...attrs} bind:checked={$formProduct.isactive} />
												<Form.Label>Is Active?</Form.Label>
											</div>
											<input name={attrs.name} value={$formProduct.isactive} hidden />
										</Form.Control>
									</Form.Field>
									<Form.Field {form} name="isselfservice">
										<Form.Control let:attrs>
											<div class="flex items-center space-x-2">
												<Checkbox {...attrs} bind:checked={$formProduct.isselfservice} />
												<Form.Label>Is Self Service?</Form.Label>
											</div>
											<input name={attrs.name} value={$formProduct.isselfservice} hidden />
										</Form.Control>
									</Form.Field>
									<Form.Field {form} name="discontinued">
										<Form.Control let:attrs>
											<div class="flex items-center space-x-2">
												<Checkbox {...attrs} bind:checked={$formProduct.discontinued} />
												<Form.Label>Discontinued?</Form.Label>
											</div>
											<input name={attrs.name} value={$formProduct.discontinued} hidden />
										</Form.Control>
									</Form.Field>
								</div>
							</Card.Content>
						</Card.Root>

						<Card.Root>
							<Card.Header>
								<Card.Title>Dates</Card.Title>
							</Card.Header>
							<Card.Content>
								<div class="space-y-2">
									<div class="grid grid-cols-[1fr_2fr] items-center">
										<Label>Created</Label>
										<Input type="text" readonly value={formatDateTime($formProduct.created)} />
									</div>
									<div class="grid grid-cols-[1fr_2fr] items-center">
										<Label>Updated</Label>
										<Input type="text" readonly value={formatDateTime($formProduct.updated)} />
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					</div>
				</div>
				<div class="mt-6 flex space-x-4">
					<Button type="submit" disabled={!isProductTainted($productTainted)}
						>Save Product Info</Button
					>
					<Button type="button" on:click={() => form.reset()}>Reset Changes</Button>
				</div>
			</form>
		</Tabs.Content>

		<Tabs.Content value="vendors">
			<Card.Root>
				<Card.Header>
					<Card.Title>Vendor Information</Card.Title>
				</Card.Header>
				<Card.Content>
					<form method="post" action="?/mProductPo" use:enhanceProductPO>
						<div class="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-44">Updated</Table.Head>
										<Table.Head class="w-60">Partner</Table.Head>
										<Table.Head>Partner PN</Table.Head>
										<Table.Head>List Price</Table.Head>
										<Table.Head>URL</Table.Head>
										<Table.Head>Action</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each data.m_product_po as productPurchase}
										<Table.Row>
											<Table.Cell>{formatDateTime(productPurchase.updated)}</Table.Cell>
											<Table.Cell>{productPurchase.c_bpartner?.name}</Table.Cell>
											<Table.Cell>{productPurchase.vendorproductno}</Table.Cell>
											<Table.Cell
												>{formatNumber(
													productPurchase.pricelist,
													'sr-Latn',
													'decimal',
													undefined,
													2
												)}</Table.Cell
											>
											<Table.Cell>
												<a href={productPurchase.url} target="_blank" class="btn btn-square btn-xs">
													{productPurchase.url}
												</a>
											</Table.Cell>
											<Table.Cell>
												<Button
													variant="ghost"
													on:click={() => deleteProductPORow(productPurchase.id)}
													type="button"
												>
													<iconify-icon icon="ph:x-bold" width="24" height="24"></iconify-icon>
												</Button>
											</Table.Cell>
										</Table.Row>
									{/each}
									<Table.Row>
										<Table.Cell class="text-right">Add new:</Table.Cell>
										<Table.Cell>
											<Form.Field form={formPPO} name="c_bpartner_id">
												<Form.Control let:attrs>
													<Select.Root
														selected={selectedVendor}
														onSelectedChange={(v) => {
															v && ($formProductPO.c_bpartner_id = v.value);
														}}
													>
														<Select.Trigger {...attrs}>
															<Select.Value placeholder="Select a vendor" />
														</Select.Trigger>
														<Select.Content>
															{#each data.c_bpartner as { value, label }}
																<Select.Item {value} {label} />
															{/each}
														</Select.Content>
													</Select.Root>
													<input
														hidden
														bind:value={$formProductPO.c_bpartner_id}
														name={attrs.name}
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formPPO} name="vendorproductno">
												<Form.Control let:attrs>
													<Input
														{...attrs}
														bind:value={$formProductPO.vendorproductno}
														placeholder="Enter product number..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formPPO} name="pricelist">
												<Form.Control let:attrs>
													<Input
														{...attrs}
														type="number"
														step="0.01"
														bind:value={$formProductPO.pricelist}
														placeholder="Enter price..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formPPO} name="url">
												<Form.Control let:attrs>
													<Input
														{...attrs}
														bind:value={$formProductPO.url}
														placeholder="Enter URL..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Button type="submit" variant="secondary">Add</Button>
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</div>
						<input type="hidden" name="m_product_id" bind:value={$formProduct.id} />
					</form>
				</Card.Content>
			</Card.Root>
			{#if browser}
				<SuperDebug data={$formProductPO} />
			{/if}
		</Tabs.Content>

		<Tabs.Content value="barcodes">
			<Card.Root>
				<Card.Header>
					<Card.Title>Product Barcodes</Card.Title>
				</Card.Header>
				<Card.Content>
					<form method="post" action="?/mProductGtin" use:enhanceProductGtin>
						<div class="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="hidden">ID</Table.Head>
										<Table.Head>Updated</Table.Head>
										<Table.Head>GTIN</Table.Head>
										<Table.Head>Is Active</Table.Head>
										<Table.Head>Action</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each data.barcodes as barcode}
										<Table.Row>
											<Table.Cell class="hidden">{barcode.id}</Table.Cell>
											<Table.Cell class="w-44">{formatDateTime(barcode.updated)}</Table.Cell>
											<Table.Cell>{barcode.gtin}</Table.Cell>
											<Table.Cell>{barcode.isactive ? 'Yes' : 'No'}</Table.Cell>
											<Table.Cell>
												<Button
													type="submit"
													variant="ghost"
													formaction="?/deleteProductGtin"
													name="id"
													value={barcode.id}
												>
													<iconify-icon icon="ph:x-bold" width="24" height="24"></iconify-icon>
												</Button>
											</Table.Cell>
										</Table.Row>
									{/each}
									<Table.Row>
										<Table.Cell class="hidden">
											<input type="hidden" name="m_product_id" bind:value={$formProduct.id} />
										</Table.Cell>
										<Table.Cell class="text-right">Add new:</Table.Cell>
										<Table.Cell>
											<Form.Field form={formGtin} name="gtin">
												<Form.Control let:attrs>
													<Input
														{...attrs}
														bind:value={$formProductGtin.gtin}
														placeholder="Enter GTIN..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formGtin} name="isactive">
												<Form.Control let:attrs>
													<Checkbox {...attrs} bind:checked={$formProductGtin.isactive} />
													<input name={attrs.name} value={$formProductGtin.isactive} hidden />
												</Form.Control>
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Button type="submit" variant="secondary">Add</Button>
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
							{#if browser}
								<SuperDebug data={$formProductGtin} />
							{/if}
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="replenish">
			<Card.Root>
				<Card.Header>
					<Card.Title>Replenish Information</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="overflow-x-auto">
						<form method="POST" use:enhanceReplenish>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Warehouse</Table.Head>
										<Table.Head>Min Level</Table.Head>
										<Table.Head>Max Level</Table.Head>
										<Table.Head>Batch Size</Table.Head>
										<Table.Head>Source Warehouse</Table.Head>
										<Table.Head>Action</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each data.replenishes as replenish}
										<Table.Row>
											<Table.Cell>{getWarehouseName(replenish.m_warehouse_id)}</Table.Cell>
											<Table.Cell>
												<Input
													type="number"
													value={replenish.level_min}
													placeholder="Min level..."
												/>
											</Table.Cell>
											<Table.Cell>
												<Input
													type="number"
													bind:value={replenish.level_max}
													placeholder="Max level..."
												/>
											</Table.Cell>
											<Table.Cell>
												<Input
													type="number"
													bind:value={replenish.qtybatchsize}
													placeholder="Batch size..."
												/>
											</Table.Cell>
											<Table.Cell
												>{replenish.m_warehousesource_id
													? getWarehouseName(replenish.m_warehousesource_id)
													: 'N/A'}</Table.Cell
											>
											<Table.Cell>
												<Button
													variant="secondary"
													formaction="?/updReplenish"
													name="id"
													value={replenish.id}
													on:click={() => ($formIdReplenish = replenish.id.toString())}>Save</Button
												>
											</Table.Cell>
										</Table.Row>
									{/each}
									<Table.Row>
										<Table.Cell>
											<Form.Field form={formReplenish} name="m_warehouse_id">
												<Form.Control let:attrs>
													<Select.Root
														selected={selectedWarehouse}
														onSelectedChange={(v) => {
															v && ($formProductReplenish.m_warehouse_id = v.value);
														}}
													>
														<Select.Trigger {...attrs}>
															<Select.Value placeholder="Select warehouse" />
														</Select.Trigger>
														<Select.Content>
															{#each data.warehouses as { value, label }}
																<Select.Item {value} {label} />
															{/each}
														</Select.Content>
													</Select.Root>
													<input
														hidden
														bind:value={$formProductReplenish.m_warehouse_id}
														name={attrs.name}
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formReplenish} name="level_min">
												<Form.Control let:attrs>
													<Input
														{...attrs}
														type="number"
														bind:value={$formProductReplenish.level_min}
														placeholder="Min level..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formReplenish} name="level_max">
												<Form.Control let:attrs>
													<Input
														{...attrs}
														type="number"
														bind:value={$formProductReplenish.level_max}
														placeholder="Max level..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formReplenish} name="qtybatchsize">
												<Form.Control let:attrs>
													<Input
														{...attrs}
														type="number"
														bind:value={$formProductReplenish.qtybatchsize}
														placeholder="Batch size..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Form.Field form={formReplenish} name="m_warehousesource_id">
												<Form.Control let:attrs>
													<Select.Root
														selected={selectedSourceWarehouse}
														onSelectedChange={(v) => {
															v && ($formProductReplenish.m_warehousesource_id = v.value);
														}}
													>
														<Select.Trigger {...attrs}>
															<Select.Value placeholder="Select source warehouse" />
														</Select.Trigger>
														<Select.Content>
															{#each data.warehouses as { value, label }}
																<Select.Item {value} {label} />
															{/each}
														</Select.Content>
													</Select.Root>
													<input
														hidden
														bind:value={$formProductReplenish.m_warehousesource_id}
														name={attrs.name}
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Button type="submit" variant="secondary">Add</Button>
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</form>
					</div>
					<input type="hidden" name="m_product_id" bind:value={$formProduct.id} />
				</Card.Content>
			</Card.Root>
			{#if browser}
				<SuperDebug data={$formProductReplenish} />
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</div>
