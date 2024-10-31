<script lang="ts">
	import { invalidate } from '$app/navigation';
	import X from 'phosphor-svelte/lib/X';
	import {
		ExternalLink,
		Ellipsis,
		Package,
		CircleAlert,
		Barcode,
		Users,
		Warehouse,
		TrendingUp,
		Save,
		RotateCcw
	} from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';

	import SuperDebug, { type SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { formatDate, formatDateTime, formatNumber } from '$lib/style/locale';
	import * as Form from '$lib/components/ui/form';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { browser } from '$app/environment';
	import * as Select from '$lib/components/ui/select';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { crudmProductPoSchema } from '$lib/types/supabase/mProductPo.validator';
	import * as Tabs from '$lib/components/ui/tabs';
	let { data } = $props();
	import { crudMProductSchema } from '$lib/types/supabase/product.validator';

	/* $effect(() => {
		toast.success(JSON.stringify(data.barcodes));
	}); */

	import Combobox2 from '$lib/components/melt/ComboBox2.svelte';
	import { schemaProductGtinID, replenishSchema } from '../zod.validator.js';
	import SquareArrowOutUpRight from 'lucide-svelte/icons/square-arrow-out-up-right';
	import ProductBarcodes from './ProductBarcodes.svelte';
	import { back } from '@melt-ui/svelte/internal/helpers';
	async function deleteProductPORow(rowToBeDeleted: number) {
		const { error } = await data.supabase.from('m_product_po').delete().eq('id', rowToBeDeleted);
		if (error) throw error;
		return;
	}

	const productForm = superForm(data.formProduct, {
		validators: zodClient(crudMProductSchema),
		onUpdated(event) {
			const { form } = event;
			if (form.valid) {
				toast.success('Product updated successfully', {
					description: form.message || 'Your changes have been saved.'
				});

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
	} = productForm;

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
		validators: zodClient(schemaProductGtinID),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Barcode operation successful');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Barcode operation failed');
			}
		}
	});
	const {
		form: formProductGtin,
		enhance: enhanceProductGtin,
		formId: formIdProductGtin
	} = formGtin;

	const formReplenish = superForm(data.formReplenish, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
				// Invalidate the page to refresh all data
				invalidate('catalog:product');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to update replenish data', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form: formReplenishUpd, enhance: enhanceReplenishUpd } = formReplenish;
	//	const { form: formReplenishMod, enhance: enhanceReplenishMod } = formReplenish;

	/* 	let selectedWarehouse = $derived(
		$formReplenishNew.m_warehouse_id
			? data.warehouses?.find((v) => v.value === $formReplenishNew.m_warehouse_id)
			: undefined
	);

	let selectedSourceWarehouse = $derived(
		$formReplenishNew.m_warehousesource_id
			? data.warehouses?.find((v) => v.value === $formReplenishNew.m_warehousesource_id)
			: undefined
	); */

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

	function handleNetQuantityInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = parseFloat(input.value);
		if (!isNaN(value)) {
			$formProduct.net_quantity = value;
		}
	}
	let editMode: boolean = $state(false);
	let originalProduct: typeof $formProduct = $state({} as typeof $formProduct);
	function saveChanges(): void {
		//console.log("Saving changes:", product);
		//product.updated = new Date().toISOString();
		editMode = false;
	}

	function toggleEditMode(): void {
		if (!editMode) {
			originalProduct = JSON.parse(JSON.stringify($formProduct));
		}
		editMode = !editMode;
	}

	function resetChanges(): void {
		$formProduct = JSON.parse(JSON.stringify(originalProduct));
		editMode = false;
	}
	let isDrawerOpen: boolean = $state(false);
	let editedProduct = $state({ ...$formProduct });
	function openDrawer(): void {
		editedProduct = JSON.parse(JSON.stringify($formProduct));
		isDrawerOpen = true;
	}
	const warehousesWithStringValues = data.warehouses.map((warehouse) => ({
		value: warehouse.value.toString(),
		label: warehouse.label
	}));
	let selectedWarehouseSourceValue = $state('');
	const triggerContentWarehouseSourceValue = $derived(
		warehousesWithStringValues.find((f) => f.value === selectedWarehouseSourceValue)?.label ??
			'Select a fruit'
	);
</script>

<div class="container mx-auto p-4">
	<Card.Root class="mb-8">
		<Card.Header class="flex flex-row items-center justify-between">
			<div>
				<Card.Title class="flex items-center gap-2 text-3xl font-bold">
					<Package class="h-8 w-8" />
					{$formProduct.name}
				</Card.Title>
				<Card.Description class="text-lg">Product ID: {$formProduct.id}</Card.Description>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" size="icon">
						<Ellipsis class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={openDrawer}>Edit</DropdownMenu.Item>
					<DropdownMenu.Item>Delete</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Card.Header>
		<Card.Content>
			<div class="mb-4 flex flex-wrap gap-4">
				<div class="mb-4 flex flex-wrap gap-4">
					<Badge variant={$formProduct.isactive ? 'default' : 'secondary'}>
						{$formProduct.isactive ? 'Active' : 'Inactive'}
					</Badge>
					<Badge variant={$formProduct.isselfservice ? 'default' : 'secondary'}>
						{$formProduct.isselfservice ? 'Self Service' : 'Not Self Service'}
					</Badge>
					<Badge variant={$formProduct.discontinued ? 'destructive' : 'secondary'}>
						{$formProduct.discontinued ? 'Discontinued' : 'Not Discontinued'}
					</Badge>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<h3 class="mb-2 text-lg font-semibold">Basic Information</h3>
					<Table.Root>
						<Table.Body>
							<Table.Row>
								<Table.Cell class="font-medium">SKU</Table.Cell>
								<Table.Cell>{$formProduct.sku}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell class="font-medium">UOM</Table.Cell>
								<Table.Cell>{$formProduct.c_uom_id}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell class="font-medium">Tax</Table.Cell>
								<Table.Cell>{$formProduct.c_taxcategory_id}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell class="font-medium">Category</Table.Cell>
								<Table.Cell>{$formProduct.m_product_category_id}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell class="font-medium">MPN</Table.Cell>
								<Table.Cell>{$formProduct.mpn}</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>
				</div>
				<div>
					<h3 class="mb-2 text-lg font-semibold">Packaging Information</h3>
					<Table.Root>
						<Table.Body>
							<Table.Row>
								<Table.Cell class="font-medium">Units per Pack</Table.Cell>
								<Table.Cell>{$formProduct.unitsperpack}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell class="font-medium">Units per Pallet</Table.Cell>
								<Table.Cell>{$formProduct.unitsperpallet}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell class="font-medium">Net Quantity</Table.Cell>
								<Table.Cell>{$formProduct.net_qty_uom_id} {$formProduct.net_qty_uom_id}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell class="font-medium">Shelf Life</Table.Cell>
								<Table.Cell>{$formProduct.shelf_life}</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>
				</div>
				<div>
					<h3 class="mb-2 text-lg font-semibold">Barcodes</h3>
					<div class="flex flex-col gap-2">
						{#each data.barcodes as barcode}
							<Badge variant="outline" class="flex items-center gap-2">
								<Package class="h-4 w-4" />
								{barcode.gtin}
							</Badge>
						{/each}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
	<h1 class="mb-6 text-3xl font-bold">Product Management</h1>
	<Tabs.Root value="info" class="w-full">
		<Tabs.List class="mb-4">
			<Tabs.Trigger value="info">Product Info</Tabs.Trigger>
			<Tabs.Trigger value="vendors">Vendors</Tabs.Trigger>
			<Tabs.Trigger value="barcodes">Barcodes</Tabs.Trigger>
			<Tabs.Trigger value="replenish">Replenish</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="info">
			<form method="post" action="?/productUPD" use:enhanceProduct id="product-form">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card.Root class="md:col-span-2">
						<Card.Header>
							<Card.Title>Product Information</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="space-y-4">
								<Form.Field form={productForm} name="name">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Name</Form.Label>
											<Input {...props} autocomplete="off" bind:value={$formProduct.name} />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
								<div class="grid grid-cols-3 gap-3">
									<Form.Field form={productForm} name="c_uom_id">
										<Form.Control>
											{#snippet children({ props })}
												<Form.Label>UoM</Form.Label>
												<!-- <Select.Root
											 type="single"
											 bind:value={$formProduct.c_uom_id}
											 name={props.name}
												selected={selectedUoM}
												
											>
												<Select.Trigger {...props}>
													{$formProduct.c_uom_id ? "Select a verified email to display":"Izaberi me"} 
												</Select.Trigger>
												<Select.Content>
													{#if data.uom}
														{#each data.uom as v}
															<Select.Item value={v.value} label={v.label} />
														{/each}
													{/if}
												</Select.Content>
											</Select.Root> -->
												<!-- <input hidden bind:value={$formProduct.c_uom_id} name={attrs.name} /> -->
											{/snippet}
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<Form.Field form={productForm} name="c_taxcategory_id">
										<Form.Control>
											<Form.Label>Tax</Form.Label>
											<!-- <Select.Root
												selected={selectedTax}
												onSelectedChange={(v) => {
													v && ($formProduct.c_taxcategory_id = v.value);
												}}
											>
												<Select.Trigger {...props}>
													<Select.Value placeholder="Select Tax" />
												</Select.Trigger>
												<Select.Content>
													{#if data.tax}
														{#each data.tax as v}
															<Select.Item value={v.value} label={v.label} />
														{/each}
													{/if}
												</Select.Content>
											</Select.Root> -->
											<!-- <input hidden bind:value={$formProduct.c_taxcategory_id} name={props.name} /> -->
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<!-- <Form.Field form={productForm} name="m_product_category_id">
										<Form.Control>
											<Form.Label>Category</Form.Label>
											<Combobox2
												{...props}
												options={data.categories}
												bind:value={$formProduct.m_product_category_id}
											/>
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field> -->
								</div>
								<div class="grid grid-cols-3 gap-3">
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
												<Input type="number" bind:value={$formProduct.unitsperpallet} {...props} />
											{/snippet}
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
									<Form.Field form={productForm} name="descriptionurl">
										<Form.Control>
											{#snippet children({ props })}
												<Form.Label>Manufacturer URL</Form.Label>
												<Input type="url" bind:value={$formProduct.descriptionurl} {...props} />
											{/snippet}
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								</div>
								<div class="grid grid-cols-2 gap-3">
									<!-- <Form.Field form={productForm} name="net_quantity">
										<Form.Control>
											{#snippet children({ props })}
											<Form.Label>Net Quantity</Form.Label>
											<Input
												type="number"
												step="0.001"
												bind:value={$formProduct.net_quantity}
												on:input={handleNetQuantityInput}
												{...props}
											/>
											{/snippet}
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field> -->
									<Form.Field form={productForm} name="net_qty_uom_id">
										<Form.Control>
											<Form.Label>Net Quantity UoM</Form.Label>
											<!-- <Select.Root
												selected={data.uom?.find((v) => v.value === $formProduct.net_qty_uom_id)}
												onSelectedChange={(v) => {
													v && ($formProduct.net_qty_uom_id = v.value);
												}}
											>
												<Select.Trigger {...props}>
													<Select.Value placeholder="Select Net Quantity UoM" />
												</Select.Trigger>
												<Select.Content>
													{#if data.uom}
														{#each data.uom as v}
															<Select.Item value={v.value} label={v.label} />
														{/each}
													{/if}
												</Select.Content>
											</Select.Root> -->
											<!-- <input hidden bind:value={$formProduct.net_qty_uom_id} name={props.name} /> -->
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								</div>
								<Form.Field form={productForm} name="mpn">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Manufacturer Part Number (MPN)</Form.Label>
											<Input {...props} autocomplete="off" bind:value={$formProduct.mpn} />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
								<div class="grid grid-cols-3 gap-3">
									<Form.Field form={productForm} name="shelf_life">
										<Form.Control
											>{#snippet children({ props })}
												<Form.Label>Shelf Life (days)</Form.Label>
												<Input
													type="number"
													bind:value={$formProduct.shelf_life}
													{...props}
												/>{/snippet}
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								</div>
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
									<Form.Field form={productForm} name="id">
										<Form.Control
											>{#snippet children({ props })}
												<div class="grid grid-cols-[1fr_2fr] items-center">
													<Form.Label>ID</Form.Label>
													<Input {...props} bind:value={$formProduct.id} readonly />
												</div>{/snippet}
										</Form.Control>
									</Form.Field>
									<Form.Field form={productForm} name="sku">
										<Form.Control
											>{#snippet children({ props })}
												<div class="grid grid-cols-[1fr_2fr] items-center">
													<Form.Label>SKU</Form.Label>
													<Input {...props} bind:value={$formProduct.sku} readonly />
												</div>{/snippet}
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
									<!-- <Form.Field form={productForm} name="isactive">
										<Form.Control>
											<div class="flex items-center space-x-2">
												<Checkbox {...props} bind:checked={$formProduct.isactive as boolean} />
												<Form.Label>Is Active?</Form.Label>
											</div>
											<input name={attrs.name} value={$formProduct.isactive} hidden />
										</Form.Control>
									</Form.Field>
									<Form.Field form={productForm} name="isselfservice">
										<Form.Control>
											<div class="flex items-center space-x-2">
												<Checkbox {...props} bind:checked={$formProduct.isselfservice as boolean} />
												<Form.Label>Is Self Service?</Form.Label>
											</div>
											<input name={attrs.name} value={$formProduct.isselfservice} hidden />
										</Form.Control>
									</Form.Field>
									<Form.Field form={productForm} name="discontinued">
										<Form.Control>
											<div class="flex items-center space-x-2">
												<Checkbox {...props} bind:checked={$formProduct.discontinued as boolean} />
												<Form.Label>Discontinued?</Form.Label>
											</div>
											<input name={attrs.name} value={$formProduct.discontinued} hidden />
										</Form.Control>
									</Form.Field> -->
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
					<Button type="button" onclick={() => productForm.reset()}>Reset Changes</Button>
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
									<!-- {#each data.m_product_po as productPurchase}
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
												{#if productPurchase.url}
													<a
														href={productPurchase.url}
														target="_blank"
														class="btn btn-square btn-xs"
													>
														<SquareArrowOutUpRight />
													</a>
												{/if}
											</Table.Cell>
											<Table.Cell>
												<Button
													variant="ghost"
													onclick={() => deleteProductPORow(productPurchase.id)}
													type="button"
												>
													<X size={16} weight="bold" />
												</Button>
											</Table.Cell>
										</Table.Row>
									{/each} -->
									<Table.Row>
										<!-- <Table.Cell class="text-right">Add new:</Table.Cell>
										<Table.Cell>
											<Form.Field form={formPPO} name="c_bpartner_id">
												<Form.Control>
													<Select.Root
														selected={selectedVendor}
														onSelectedChange={(v) => {
															v && ($formProductPO.c_bpartner_id = v.value);
														}}
													>
														<Select.Trigger {...props}>
															<Select.Value placeholder="Select a vendor" />
														</Select.Trigger>
														<Select.Content class="max-h-80 overflow-auto">
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
												<Form.Control>
													<Input
														{...props}
														bind:value={$formProductPO.vendorproductno}
														placeholder="Enter product number..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell> -->
										<!-- 	<Table.Cell>
											<Form.Field form={formPPO} name="pricelist">
												<Form.Control>
													<Input
														{...props}
														type="number"
														step="0.01"
														bind:value={$formProductPO.pricelist}
														placeholder="Enter price..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell> -->
										<!-- <Table.Cell colspan={2}>
											<Form.Field form={formPPO} name="url">
												<Form.Control>
													<Input
														{...props}
														bind:value={$formProductPO.url}
														placeholder="Enter URL..."
													/>
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</Table.Cell>
										<Table.Cell>
											<Button type="submit" variant="secondary">Add</Button>
										</Table.Cell> -->
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

		<!-- <Tabs.Content value="barcodes">
			{#if $formProduct.id}
				<ProductBarcodes
					formProductGtin={data.formProductGtin}
					formProductGtinId={data.formProductGtinId}
					barcodes={data.barcodes}
					productId={$formProduct.id}
				/>
			{/if}
		</Tabs.Content> -->
		<Tabs.Content value="replenish">
			<!-- <Card.Root class="mb-2">
				<Card.Header>
					<Card.Title>Storage on hand by warehouse</Card.Title>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Warehouse</Table.Head>
								<Table.Head>Quantity</Table.Head>
								<Table.Head>Reservation</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.stock as stock}
								<Table.Row>
									<Table.Cell class="font-medium"
										>{data.warehouses.find((w) => w.value === stock.warehouse_id)
											?.label}</Table.Cell
									>
									<Table.Cell>{stock.qtyonhand}</Table.Cell>
									<Table.Cell>Nisam još ubacio</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root> -->
			<!-- <Card.Root class="mb-2">
				<Card.Header>
					<Card.Title>Sales by two week period</Card.Title>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								{#each data.salesByWeeks as week}
									<Table.Head>
										{formatDate(week.start_date)}
									</Table.Head>
								{/each}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							<Table.Row>
								{#each data.salesByWeeks as week}
									<Table.Head>
										{week.total_izlaz}
									</Table.Head>
								{/each}</Table.Row
							>
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root> -->
			<!-- <Card.Root>
				<Card.Header>
					<Card.Title>Replenish Information</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="overflow-x-auto">
						<form method="post" action="?/modReplenish" use:enhanceReplenishUpd>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-1/5">Warehouse</Table.Head>
										<Table.Head class="w-1/5">Min Level</Table.Head>
										<Table.Head class="w-1/5">Max Level</Table.Head>
										<Table.Head class="w-1/5">Batch Size</Table.Head>
										<Table.Head class="w-1/5">Source Warehouse</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each $formReplenishUpd.replenishes as replenish}
										<Table.Row>
											<Table.Cell class="w-1/5">
												<Select.Root
													selected={data.warehouses.find(
														(w) => w.value === replenish.m_warehouse_id
													)}
													onSelectedChange={(v) => {
														if (v) replenish.m_warehouse_id = v.value;
													}}
												>
													<Select.Trigger class="w-full">
														<Select.Value placeholder="Select warehouse" />
													</Select.Trigger>
													<Select.Content>
														{#each data.warehouses as warehouse}
															<Select.Item value={warehouse.value} label={warehouse.label} />
														{/each}
													</Select.Content>
												</Select.Root>
												<input hidden name="m_warehouse_id" bind:value={replenish.m_warehouse_id} />
											</Table.Cell>
											<Table.Cell class="w-1/5">
												<Input
													type="number"
													bind:value={replenish.level_min}
													placeholder="Min level..."
												/>
											</Table.Cell>
											<Table.Cell class="w-1/5">
												<Input
													type="number"
													bind:value={replenish.level_max}
													placeholder="Max level..."
												/>
											</Table.Cell>
											<Table.Cell class="w-1/5">
												<Input
													type="number"
													bind:value={replenish.qtybatchsize}
													placeholder="Batch size..."
												/>
											</Table.Cell>
											<Table.Cell class="w-1/5">
												<Select.Root 
												type="single"
												 name="m_warehousesource_id" 
												 bind:value={selectedWarehouseSourceValue}
													
												>
													<Select.Trigger>
														{triggerContentWarehouseSourceValue}
													</Select.Trigger>
													<Select.Content>
														{#each warehousesWithStringValues as warehouse}
															<Select.Item value={warehouse.value} label={warehouse.label} />
														{/each}
													</Select.Content>
												</Select.Root>
												
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
							<Form.Button>Save</Form.Button>
							<Button
								variant="default"
								onclick={() => {
									if ($formProduct.id) {
										$formReplenishUpd.replenishes = [
											...$formReplenishUpd.replenishes,
											{
												ad_org_id: undefined,
												isactive: undefined,
												ad_client_id: undefined,
												m_warehouse_id: 0,
												m_product_id: $formProduct.id,
												level_max: undefined,
												level_min: undefined,
												m_locator_id: undefined,
												m_replenish_uu: undefined,
												m_warehousesource_id: undefined,
												qtybatchsize: undefined
											}
										];
									}
								}}>Add</Button
							>
						</form>
					</div>
				</Card.Content>
			</Card.Root> -->
			<!-- 	{#if browser}
				<SuperDebug data={$formReplenishUpd} />
			{/if} -->
		</Tabs.Content>
	</Tabs.Root>
</div>

<Drawer.Root open={isDrawerOpen} onOpenChange={(open) => (isDrawerOpen = open)} direction="right">
	Hello
</Drawer.Root>
