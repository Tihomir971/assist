<script lang="ts">
	import type { PageData, SubmitFunction } from './$types';
	import { applyAction, enhance } from '$app/forms';
	import { afterNavigate, goto, invalidate } from '$app/navigation';
	import { base } from '$app/paths';
	import { DateTimeFormat, numberFormat } from '$lib/scripts/format';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { Combobox } from '$lib/components/combobox';
	import { Dialog } from '$lib/components/dialog2';
	import { findLabelByValue } from '$lib/scripts/objects';
	//	import { Checkbox } from '$lib/components/checkbox';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Resizable from '$lib/components/ui/resizable';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table/index.js';

	import * as Tabs from '$lib/components/ui/tabs';

	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	//import { PhX } from '$lib/icons';
	//import PhX from '~icons/ph/x?width=1.2em&height=1.2em';
	//import PhX from '~icons/ph/x';
	export let data: PageData;
	$: ({ product, categories, productPurchasing, supabase, partners, replenishes, warehouses } =
		data);
	$: createdLocal = product?.created ? DateTimeFormat(product?.created) : null;
	$: updatedLocal = product?.updated ? DateTimeFormat(product?.updated) : null;

	let newURL = '';
	let newPartnerPN = '';
	let initialProductForm: any = undefined;
	let modified = false;
	$: if (initialProductForm && JSON.stringify(product) !== JSON.stringify(initialProductForm)) {
		modified = true;
	} else {
		modified = false;
	}
	let previousPage: string = base;
	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
		previousPage = previousPage + '?' + from?.url.searchParams.toString() || previousPage;
		initialProductForm = { ...product };
	});

	let columns = [
		'Organization',
		'Business Partner',
		'Active',
		'GTIN',
		'Partner PN',
		'List Price',
		'Updated',
		'URL'
	];
	let addingProductPO = false;

	async function deleteProductPORow(rowToBeDeleted: number) {
		const { error } = await supabase.from('m_product_po').delete().eq('id', rowToBeDeleted);
		if (error) throw error;
		return;
	}

	interface MyRequestBody {
		source: string;
		barcode: string;
	}
	async function handleFindProductOnWeb() {
		addingProductPO = true;
		const apiUrl = '/api/scraper/findProduct/';
		let selectElement = document.getElementsByName('bpartner')[0] as HTMLSelectElement;
		let selectedValue = selectElement.value;
		let selectedLabel = partners?.find((partner) => partner.value === Number(selectedValue))?.label;
		/* const response = fetch('https://ass-api.tihomir-d4c.workers.dev', { */
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				body: JSON.stringify({ source: selectedLabel, barcode: product?.barcode }),
				headers: {
					'content-type': 'application/json'
				}
			});

			if (response.status === 200) {
				const data = await response.json();
				newURL = data.path;
				newPartnerPN = product?.barcode ?? '';
			} else if (response.status === 204) {
				addToast({
					data: {
						title: 'Product search',
						description: `Product: "${product?.name}" not found!`,
						color: 'alert-info'
					}
				});
			}
		} catch (error) {
			newURL = 'Unedefined';
		} finally {
			addingProductPO = false;
		}

		//findProductOnWeb(product?.barcode, selectedValue);
	}

	function getInfo(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		throw new Error('Function not implemented.');
	}
</script>

<div class="h-full">
	<div class="container mx-auto flex items-center justify-between pt-4">
		<hgroup class="prose">
			<h3>Edit product</h3>
			<p>Detailed information about product</p>
		</hgroup>

		<Button on:click={() => history.back()} variant="outline">Back</Button>
		<!-- <button type="button" on:click={() => history.back()} class="btn btn-outline">Back</button> -->
	</div>
	<div class="divider"></div>
	<Resizable.PaneGroup direction="vertical">
		<Resizable.Pane defaultSize={60}>
			{#if product}
				<div class="mx-auto max-w-5xl flex-grow overflow-hidden">
					<form
						method="post"
						action="?/updateProduct"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									console.log('result', result.data);

									addToast({
										data: {
											title: 'Product update',
											description: `Product: "${product?.name}" successfully updated!`,
											color: 'alert-success'
										}
									});
									//initialProductForm = Object.assign({}, product);
									/* invalidate('catalog:product'); */
									history.back();
								} else {
									addToast({
										data: {
											title: 'Product update',
											description: `Error updating: "${product?.name}"!`,
											color: 'alert-error'
										}
									});
								}
							};
						}}
						class="flex h-full w-full flex-col"
					>
						<div class="flex items-center justify-between gap-x-6 pb-2">
							<Button variant="destructive" formaction="?/deleteProduct" class="btn btn-warning"
								>Delete</Button
							>
							<!-- <button type="submit" formaction="?/deleteProduct" class="btn btn-warning"
								>Delete</button
							> -->
							<div>
								<Button formaction="?/getProductInfo">Get Info</Button>
								<!-- <button class="btn btn-secondary" formaction="?/getProductInfo">Get Info</button> -->
								<Button
									type="reset"
									disabled={!modified}
									on:click={() => (product = { ...initialProductForm })}>Reset</Button
								>
								<!-- <button
									type="reset"
									disabled={!modified}
									class="btn btn-secondary"
									on:click={() => (product = { ...initialProductForm })}>Reset</button
								> -->
								<Button type="submit" disabled={!modified} class="btn btn-primary">Save</Button>
								<!-- <button type="submit" disabled={!modified} class="btn btn-primary">Save</button> -->
							</div>
						</div>
						<div
							class="grid h-full flex-grow grid-cols-1 gap-x-6 gap-y-1 overflow-auto px-2 py-2 sm:grid-cols-12"
						>
							<!-- Is Self-service? -->
							<div class="col-span-3 flex items-center space-x-2">
								<Checkbox
									id="isselfservice"
									bind:checked={product.isselfservice}
									aria-labelledby="terms-label"
								/>
								<Label
									id="isselfservice-label"
									for="isselfservice"
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Is Self-service?
								</Label>
							</div>
							<!-- <label class="col-span-3 flex cursor-pointer items-center gap-x-3">
								<input
									name="isselfservice"
									type="checkbox"
									bind:checked={product.isselfservice}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Is Self-service?</span>
							</label> -->
							<!-- Discontinued? -->
							<div class="col-span-3 flex items-center space-x-2">
								<Checkbox
									id="discontinued"
									bind:checked={product.discontinued}
									aria-labelledby="terms-label"
								/>
								<Label
									id="discontinued-label"
									for="discontinued"
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Discontinued?
								</Label>
							</div>
							<!-- <label class="col-span-3 flex cursor-pointer items-center gap-x-3">
								<input
									type="checkbox"
									name="discontinued"
									bind:checked={product.discontinued}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Discontinued?</span>
							</label> -->
							<!-- Is Active? -->
							<div class="col-span-3 flex items-center space-x-2">
								<Checkbox
									id="isactive"
									bind:checked={product.isactive}
									aria-labelledby="terms-label"
								/>
								<Label
									id="isactive-label"
									for="isactive"
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Is Active?
								</Label>
							</div>
							<!-- <label class="col-span-3 flex cursor-pointer items-center gap-x-3">
								<input
									type="checkbox"
									name="isactive"
									bind:checked={product.isactive}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Is Active?</span>
							</label> -->
							<!-- ID -->
							<div class="col-span-2 col-start-1 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="id">ID</Label>
								<Input
									name="id"
									id="id"
									type="number"
									readonly
									autocomplete="off"
									bind:value={product.id}
								/>
							</div>
							<!-- <label class="form-control col-span-2 col-start-1"> -->
							<!-- <div class="label">
									<span class="label-text">ID</span>
								</div> -->
							<!-- <Input name="id" type="number" readonly class="max-w-xs" bind:value={product.id} /> -->
							<!-- <input
									name="id"
									type="number"
									readonly
									bind:value={product.id}
									class="input input-bordered w-full"
								/> -->
							<!-- </label> -->
							<!-- SKU -->
							<div class="col-span-2 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="sku">SKU</Label>
								<Input
									name="sku"
									id="sku"
									type="text"
									readonly
									autocomplete="off"
									bind:value={product.sku}
								/>
							</div>
							<!-- <label class="form-control col-span-2">
								<div class="label">
									<span class="label-text">SKU</span>
								</div>
								<input
									name="sku"
									type="text"
									readonly
									bind:value={product.sku}
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Name -->
							<div class="col-span-8 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="name">Name</Label>
								<Input
									name="name"
									id="name"
									type="text"
									readonly
									autocomplete="off"
									bind:value={product.name}
								/>
							</div>
							<!-- <label class="form-control col-span-8">
								<div class="label">
									<span class="label-text">Name</span>
								</div>
								<input
									name="name"
									type="text"
									bind:value={product.name}
									autocomplete="off"
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Barcode -->
							<div class="col-span-3 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="barcode">Barcode</Label>
								<Input
									name="barcode"
									id="barcode"
									type="text"
									autocomplete="off"
									bind:value={product.barcode}
								/>
							</div>
							<!-- <label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">Barcode</span>
								</div>
								<input
									id="barcode"
									name="barcode"
									type="text"
									bind:value={product.barcode}
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Brand -->
							<div class="col-span-3 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="brand">Brand</Label>
								<Input
									name="brand"
									id="brand"
									type="text"
									readonly
									autocomplete="off"
									bind:value={product.brand}
								/>
							</div>
							<!-- <label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">Brand</span>
								</div>
								<input
									name="brand"
									type="text"
									bind:value={product.brand}
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- MPN -->
							<div class="col-span-3 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="mpn">MPN</Label>
								<Input
									name="mpn"
									id="mpn"
									type="text"
									readonly
									autocomplete="off"
									bind:value={product.mpn}
								/>
							</div>
							<!-- <label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">MPN</span>
								</div>
								<input
									name="mpn"
									type="text"
									bind:value={product.mpn}
									autocomplete="off"
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Manufacturer URL -->
							<div class="col-span-3 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="descriptionurl">Manufacturer URL</Label>
								<div class="flex w-full max-w-sm items-center space-x-2">
									<Input
										name="descriptionurl"
										id="descriptionurl"
										type="text"
										readonly
										autocomplete="off"
										bind:value={product.descriptionurl}
									/>
									<Button href={product?.descriptionurl}>
										<iconify-icon icon="ph:link-bold" width="24" height="24"></iconify-icon>
									</Button>
								</div>
							</div>
							<!-- <label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">Manufacturer URL</span>
								</div>
								<div class="join">
									<input
										id="descriptionurl"
										name="descriptionurl"
										type="url"
										bind:value={product.descriptionurl}
										autocomplete="off"
										class="input join-item input-bordered w-full"
									/>
									<a
										type="button"
										href={product?.descriptionurl}
										target="_blank"
										class="btn btn-square join-item"
										><iconify-icon icon="ph:link-bold" width="24" height="24"></iconify-icon></a
									>
								</div>
							</label> -->
							<!-- Category -->
							{#if categories}
								<Combobox
									labela="Category"
									name="m_product_category_id"
									options={categories}
									bind:value={product.m_product_category_id}
								></Combobox>
							{/if}
							<!-- UoM -->
							<div class="col-span-2 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="c_uom_id">UoM</Label>
								<Input
									name="c_uom_id"
									id="c_uom_id"
									type="text"
									readonly
									autocomplete="off"
									bind:value={product.c_uom_id}
								/>
							</div>
							<!-- <label class="form-control col-span-2">
								<div class="label">
									<span class="label-text">UoM</span>
								</div>
								<input
									name="c_uom_id"
									type="text"
									bind:value={product.c_uom_id}
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Units per Pack -->
							<div class="col-span-2 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="unitsperpack">Units per Pack</Label>
								<Input
									name="unitsperpack"
									id="unitsperpack"
									type="number"
									step="0.001"
									autocomplete="off"
									bind:value={product.unitsperpack}
								/>
							</div>
							<!-- <label class="form-control col-span-2">
								<div class="label">
									<span class="label-text">Units per Pack</span>
								</div>
								<input
									name="unitsperpack"
									type="number"
									step="0.001"
									bind:value={product.unitsperpack}
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Condition -->
							<div class="col-span-3 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="condition">Condition</Label>
								<Input
									name="condition"
									id="condition"
									type="text"
									readonly
									autocomplete="off"
									bind:value={product.condition}
								/>
							</div>
							<!-- 	<label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">Condition</span>
								</div>
								<input
									id="condition"
									name="condition"
									type="text"
									bind:value={product.condition}
									autocomplete="off"
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Created -->
							<div class="col-span-3 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="condition">Created</Label>
								<Input
									name="created"
									id="created"
									type="datetime"
									readonly
									autocomplete="off"
									bind:value={createdLocal}
								/>
							</div>
							<!-- <label class="form-control col-span-3 col-start-1">
								<div class="label">
									<span class="label-text">Created</span>
								</div>
								<input
									name="created"
									type="datetime"
									readonly
									bind:value={createdLocal}
									class="input input-bordered w-full"
								/>
							</label> -->
							<!-- Updated -->
							<div class="col-span-3 flex w-full max-w-sm flex-col gap-1.5">
								<Label for="updated">Updated</Label>
								<Input
									name="updated"
									id="updated"
									type="datetime"
									readonly
									autocomplete="off"
									bind:value={updatedLocal}
								/>
							</div>
							<!-- <label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">Updated</span>
								</div>
								<input
									name="updated"
									type="datetime"
									readonly
									bind:value={updatedLocal}
									class="input input-bordered w-full"
								/>
							</label> -->
						</div>
					</form>
				</div>
			{/if}
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={40}>
			<div class="container mx-auto">
				<Tabs.Root value="purchasing">
					<Tabs.List>
						<Tabs.Trigger value="purchasing">Purchasing</Tabs.Trigger>
						<Tabs.Trigger value="replenish">Replenish</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="purchasing">
						{#if productPurchasing && product}
							<div class="col-span-full w-full">
								<form
									method="post"
									action="?/addProductPO"
									use:enhance={() => {
										addingProductPO = true;

										return async ({ update }) => {
											update();
											addingProductPO = false;
										};
									}}
								>
									<Input type="text" name="m_product_id" hidden bind:value={product.id} required />
									<div class="overflow-x-auto">
										<Table.Root>
											<Table.Header>
												<Table.Row>
													{#each columns as column}
														<Table.Head>{column}</Table.Head>
													{/each}
												</Table.Row>
											</Table.Header>
											<Table.Body>
												{#each productPurchasing as productPurchase}
													<Table.Row>
														<Table.Cell>Org</Table.Cell>
														<Table.Cell>{productPurchase.c_bpartner?.name}</Table.Cell>
														<Table.Cell>
															<Checkbox checked={productPurchase.isactive} disabled />
														</Table.Cell>
														<Table.Cell>{productPurchase.barcode}</Table.Cell>
														<Table.Cell>{productPurchase.vendorproductno}</Table.Cell>
														<Table.Cell>{numberFormat(productPurchase.pricelist)}</Table.Cell>
														<Table.Cell>{DateTimeFormat(productPurchase.updated)}</Table.Cell>
														<Table.Cell
															><a
																href={productPurchase.url}
																target="_blank"
																class="btn btn-square btn-xs"
																><iconify-icon icon="ph:link-bold" width="24" height="24"
																></iconify-icon></a
															></Table.Cell
														>
														<Table.Cell>
															<Button
																variant="ghost"
																on:click={() => deleteProductPORow(productPurchase.id)}
															>
																<iconify-icon icon="ph:x-bold" width="24" height="24"
																></iconify-icon>
															</Button>
														</Table.Cell>
													</Table.Row>
												{/each}
												<Table.Row>
													<Table.Cell>Add new:</Table.Cell>
													<Table.Cell class="px-0">
														<select
															name="bpartner"
															class="select select-bordered select-sm w-full max-w-xs"
															required
															>{#if partners}
																{#each partners as { value, label }}
																	<option {value}>{label}</option>
																{/each}
															{/if}
														</select>
													</Table.Cell>
													<Table.Cell></Table.Cell>
													<Table.Cell></Table.Cell>
													<Table.Cell
														><Input
															type="text"
															name="partnerPN"
															bind:value={newPartnerPN}
														/></Table.Cell
													>
													<Table.Cell colspan={3}>
														<Input
															type="url"
															name="url"
															placeholder="Enter URL..."
															bind:value={newURL}
														/>
													</Table.Cell>
													<Table.Cell>
														{#if newURL === ''}
															<Button
																variant="ghost"
																type="submit"
																on:click={handleFindProductOnWeb}
																disabled={addingProductPO}
															>
																{#if addingProductPO}
																	<span class="loading loading-spinner"></span>
																{:else}
																	<iconify-icon icon="ph:magnifying-glass" width="24" height="24"
																	></iconify-icon>
																{/if}
															</Button>
														{:else}
															<Button variant="ghost" type="submit" disabled={addingProductPO}
																><iconify-icon icon="ph:plus-bold" width="24" height="24"
																></iconify-icon></Button
															>
														{/if}
													</Table.Cell>
												</Table.Row>
											</Table.Body>
										</Table.Root>
									</div>
								</form>
							</div>
						{/if}
					</Tabs.Content>
					<Tabs.Content value="replenish"
						>{#if replenishes && product}
							<Dialog.Root>
								<Dialog.Trigger></Dialog.Trigger>
								<Dialog.Portalled>
									<section>
										<form
											method="post"
											action="?/addReplenish"
											use:enhance={() => {
												return async ({ result, update }) => {
													if (result.type === 'success') {
														addToast({
															data: {
																title: 'Product update',
																description: `Product: "${product?.name}" successfully updated!`,
																color: 'alert-success'
															}
														});
														//initialProductForm = Object.assign({}, product);
														/* invalidate('catalog:product'); */
														history.back();
													} else {
														addToast({
															data: {
																title: 'Product update',
																description: `Error updating: "${product?.name}"!`,
																color: 'alert-error'
															}
														});
													}
												};
											}}
										>
											<div class="bg-base-300 rounded-md p-4 shadow">
												<div class="flex flex-col gap-4">
													<input
														type="text"
														name="m_product_id"
														hidden
														bind:value={product.id}
														class="input input-bordered w-full"
														required
													/>
													<label class="form-control">
														<div class="label">
															<span class="label-text">Warehouse</span>
														</div>
														<select
															name="m_warehouse_id"
															class="select select-bordered w-full"
															required
															>{#if warehouses}
																{#each warehouses as { value, label }}
																	<option {value}>{label}</option>
																{/each}
															{/if}
														</select>
													</label>
													<label class="form-control">
														<div class="label">
															<span class="label-text">Minimum Level</span>
														</div>
														<input
															type="number"
															name="level_min"
															value={0}
															class="input input-bordered w-full"
														/>
													</label>
													<label class="form-control">
														<div class="label">
															<span class="label-text">Maximum Level</span>
														</div>
														<input
															type="number"
															name="level_max"
															value={0}
															class="input input-bordered w-full"
														/>
													</label>
													<label class="form-control">
														<div class="label">
															<span class="label-text">Batch Size</span>
														</div>
														<input
															type="number"
															name="qtybatchsize"
															class="input input-bordered w-full"
														/>
													</label>
													<label class="form-control">
														<div class="label">
															<span class="label-text">Source Warehouse</span>
														</div>
														<select
															name="m_warehousesource_id"
															class="select select-bordered w-full"
															>{#if warehouses}
																<option></option>
																{#each warehouses as { value, label }}
																	<option {value}>{label}</option>
																{/each}
															{/if}
														</select>
													</label>
												</div>
											</div>
											<div class="mt-6 flex justify-end gap-4">
												<button class="btn btn-secondary"> Reject </button>
												<button class="btn btn-primary"> Save </button>
											</div>
										</form>
									</section>
								</Dialog.Portalled>
							</Dialog.Root>
							<!-- <Drawer.Trigger name="settings" class="btn btn-secondary btn-sm">Add</Drawer.Trigger> -->
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Warehouse</Table.Head>
										<Table.Head>Minimum</Table.Head>
										<Table.Head>Maximum</Table.Head>
										<Table.Head>Batch Size</Table.Head>
										<Table.Head>Source</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each replenishes as replenish}
										<Table.Row>
											<Table.Cell>
												{findLabelByValue(warehouses, replenish.m_warehouse_id)}
											</Table.Cell>
											<Table.Cell>{replenish.level_min}</Table.Cell>
											<Table.Cell>{replenish.level_max}</Table.Cell>
											<Table.Cell>{replenish.qtybatchsize ?? ''}</Table.Cell>
											<Table.Cell
												>{findLabelByValue(warehouses, replenish.m_warehousesource_id) ??
													''}</Table.Cell
											>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						{/if}
					</Tabs.Content>
					<!-- 					<div role="tablist" class="tabs tabs-bordered">
						<input
							type="radio"
							name="my_tabs_1"
							role="tab"
							class="tab"
							aria-label="Purchasing"
							checked
						/>
						<div role="tabpanel" class="tab-content"> -->
					<!-- 							{#if productPurchasing && product}
								<div class="col-span-full w-full">
									<form
										method="post"
										action="?/addProductPO"
										use:enhance={() => {
											addingProductPO = true;

											return async ({ update }) => {
												update();
												addingProductPO = false;
											};
										}}
									>
										<input
											type="text"
											name="m_product_id"
											hidden
											bind:value={product.id}
											class="input input-bordered w-full"
											required
										/>
										<div class="overflow-x-auto">
											<table class="table-sm table">
												<thead>
													<tr>
														{#each columns as column}
															<th>{column}</th>
														{/each}
													</tr>
												</thead>
												<tbody class="overflow-auto">
													{#each productPurchasing as productPurchase}
														<tr class="hover">
															<td>Org</td>
															<td>{productPurchase.c_bpartner?.name}</td>
															<td
																><input
																	type="checkbox"
																	class="checkbox-secondary checkbox checkbox-sm"
																	checked={productPurchase.isactive}
																	readonly
																/></td
															>
															<td>{productPurchase.barcode}</td>
															<td>{productPurchase.vendorproductno}</td>
															<td>{numberFormat(productPurchase.pricelist)}</td>
															<td>{DateTimeFormat(productPurchase.updated)}</td>
															<td
																><a
																	href={productPurchase.url}
																	target="_blank"
																	class="btn btn-square btn-xs"
																	><iconify-icon icon="ph:link-bold" width="24" height="24"
																	></iconify-icon></a
																></td
															>
															<td>
																<button
																	on:click={() => deleteProductPORow(productPurchase.id)}
																	class="btn btn-ghost btn-sm"
																>
																	<iconify-icon icon="ph:x-bold" width="24" height="24"
																	></iconify-icon>
																</button>
															</td>
														</tr>
													{/each}
													<tr
														><td>Add new:</td>
														<td class="px-0">
															<select
																name="bpartner"
																class="select select-bordered select-sm w-full max-w-xs"
																required
																>{#if partners}
																	{#each partners as { value, label }}
																		<option {value}>{label}</option>
																	{/each}
																{/if}
															</select>
														</td>
														<td></td>
														<td></td>
														<td
															><input
																type="text"
																name="partnerPN"
																class="input input-sm input-bordered max-w-xs"
																bind:value={newPartnerPN}
															/></td
														>
														<td colspan="3">
															<input
																type="url"
																name="url"
																placeholder="Enter URL..."
																class="input input-sm input-bordered w-full"
																bind:value={newURL}
															/>
														</td>
														<td>
															{#if newURL === ''}
																<button
																	type="submit"
																	on:click={handleFindProductOnWeb}
																	class="btn btn-ghost btn-sm"
																	disabled={addingProductPO}
																>
																	{#if addingProductPO}
																		<span class="loading loading-spinner"></span>
																	{:else}
																		<iconify-icon icon="ph:magnifying-glass" width="24" height="24"
																		></iconify-icon>
																	{/if}
																</button>
															{:else}
																<button
																	type="submit"
																	disabled={addingProductPO}
																	class="btn btn-ghost btn-sm"
																	><iconify-icon icon="ph:plus-bold" width="24" height="24"
																	></iconify-icon></button
																>
															{/if}
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									</form>
								</div>
							{/if} -->
					<!-- </div> -->

					<!-- <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Replenish" /> -->
					<!-- <div role="tabpanel" class="tab-content my-4">
							{#if replenishes && product}
								<Dialog.Root>
									<Dialog.Trigger></Dialog.Trigger>
									<Dialog.Portalled>
										<section>
											<form
												method="post"
												action="?/addReplenish"
												use:enhance={() => {
													return async ({ result, update }) => {
														if (result.type === 'success') {
															addToast({
																data: {
																	title: 'Product update',
																	description: `Product: "${product?.name}" successfully updated!`,
																	color: 'alert-success'
																}
															}); -->
					<!-- //initialProductForm = Object.assign({}, product); -->
					<!-- /* invalidate('catalog:product'); */ -->
					<!-- history.back();
														} else {
															addToast({
																data: {
																	title: 'Product update',
																	description: `Error updating: "${product?.name}"!`,
																	color: 'alert-error'
																}
															});
														}
													};
												}}
											> -->
					<!-- <div class="bg-base-300 rounded-md p-4 shadow">
													<div class="flex flex-col gap-4">
														<input
															type="text"
															name="m_product_id"
															hidden
															bind:value={product.id}
															class="input input-bordered w-full"
															required
														/>
														<label class="form-control">
															<div class="label">
																<span class="label-text">Warehouse</span>
															</div>
															<select
																name="m_warehouse_id"
																class="select select-bordered w-full"
																required
																>{#if warehouses}
																	{#each warehouses as { value, label }}
																		<option {value}>{label}</option>
																	{/each}
																{/if}
															</select>
														</label>
														<label class="form-control">
															<div class="label">
																<span class="label-text">Minimum Level</span>
															</div>
															<input
																type="number"
																name="level_min"
																value={0}
																class="input input-bordered w-full"
															/>
														</label>
														<label class="form-control">
															<div class="label">
																<span class="label-text">Maximum Level</span>
															</div>
															<input
																type="number"
																name="level_max"
																value={0}
																class="input input-bordered w-full"
															/>
														</label>
														<label class="form-control">
															<div class="label">
																<span class="label-text">Batch Size</span>
															</div>
															<input
																type="number"
																name="qtybatchsize"
																class="input input-bordered w-full"
															/>
														</label>
														<label class="form-control">
															<div class="label">
																<span class="label-text">Source Warehouse</span>
															</div>
															<select
																name="m_warehousesource_id"
																class="select select-bordered w-full"
																>{#if warehouses}
																	<option></option>
																	{#each warehouses as { value, label }}
																		<option {value}>{label}</option>
																	{/each}
																{/if}
															</select>
														</label>
													</div>
												</div> -->
					<!-- <div class="mt-6 flex justify-end gap-4">
													<button class="btn btn-secondary"> Reject </button>
													<button class="btn btn-primary"> Save </button>
												</div> -->
					<!-- </form> -->
					<!-- </section> -->
					<!-- </Dialog.Portalled> -->
					<!-- </Dialog.Root> -->
					<!-- <Drawer.Trigger name="settings" class="btn btn-secondary btn-sm">Add</Drawer.Trigger> -->
					<!-- <table class="table-sm table">
									<thead
										><tr>
											<th>Warehouse</th>
											<th>Minimum</th>
											<th>Maximum</th>
											<th>Batch Size</th>
											<th>Source</th>
										</tr>
									</thead>
									<tbody>
										{#each replenishes as replenish}
											<tr class="hover">
												<td>{findLabelByValue(warehouses, replenish.m_warehouse_id)}</td>
												<td>{replenish.level_min}</td>
												<td>{replenish.level_max}</td>
												<td>{replenish.qtybatchsize ?? ''}</td>
												<td>{findLabelByValue(warehouses, replenish.m_warehousesource_id) ?? ''}</td
												>
											</tr>
										{/each}
									</tbody>
								</table> -->
					<!-- {/if} -->
					<!-- </div> -->
					<!-- 	</div> -->
				</Tabs.Root>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
	<!-- 
<Drawer.Content name="settings" let:title let:description let:close>
	<h2 class="font-bold" use:melt={title}>Add replenich quantities</h2>
	<p use:melt={description}>Placeholder description</p>
	<div class="flex">
		<button class="btn ml-auto mt-4" use:melt={close}> Close </button>
	</div>
</Drawer.Content>
 -->
</div>
