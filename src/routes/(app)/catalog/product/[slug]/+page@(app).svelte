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
	import { Checkbox } from '$lib/components/checkbox';
	import * as Resizable from '$lib/components/resizable';

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
		<button type="button" on:click={() => history.back()} class="btn btn-outline">Back</button>
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
							<button type="submit" formaction="?/deleteProduct" class="btn btn-warning"
								>Delete</button
							>
							<div>
								<button class="btn btn-secondary" formaction="?/getProductInfo">Get Info</button>
								<button
									type="reset"
									disabled={!modified}
									class="btn btn-secondary"
									on:click={() => (product = { ...initialProductForm })}>Reset</button
								>
								<button type="submit" disabled={!modified} class="btn btn-primary">Save</button>
							</div>
						</div>
						<div
							class="grid h-full flex-grow grid-cols-1 gap-x-6 gap-y-1 overflow-auto px-2 py-2 sm:grid-cols-12"
						>
							<!-- Is Self-service? -->
							<label class="col-span-3 flex cursor-pointer items-center gap-x-3">
								<input
									name="isselfservice"
									type="checkbox"
									bind:checked={product.isselfservice}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Is Self-service?</span>
							</label>
							<!-- Discontinued? -->
							<label class="col-span-3 flex cursor-pointer items-center gap-x-3">
								<input
									type="checkbox"
									name="discontinued"
									bind:checked={product.discontinued}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Discontinued?</span>
							</label>
							<!-- Is Active? -->
							<label class="col-span-3 flex cursor-pointer items-center gap-x-3">
								<input
									type="checkbox"
									name="isactive"
									bind:checked={product.isactive}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Is Active?</span>
							</label>
							<!-- ID -->
							<label class="form-control col-span-2 col-start-1">
								<div class="label">
									<span class="label-text">ID</span>
								</div>
								<input
									name="id"
									type="number"
									readonly
									bind:value={product.id}
									class="input input-bordered w-full"
								/>
							</label>
							<!-- SKU -->
							<label class="form-control col-span-2">
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
							</label>
							<!-- Name -->
							<label class="form-control col-span-8">
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
							</label>
							<!-- Barcode -->
							<label class="form-control col-span-3">
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
							</label>
							<!-- Brand -->
							<label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">Brand</span>
								</div>
								<input
									name="brand"
									type="text"
									bind:value={product.brand}
									class="input input-bordered w-full"
								/>
							</label>
							<!-- MPN -->
							<label class="form-control col-span-3">
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
							</label>
							<!-- Manufacturer URL -->
							<label class="form-control col-span-3">
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
							</label>
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
							<label class="form-control col-span-2">
								<div class="label">
									<span class="label-text">UoM</span>
								</div>
								<input
									name="c_uom_id"
									type="text"
									bind:value={product.c_uom_id}
									class="input input-bordered w-full"
								/>
							</label>
							<!-- Units per Pack -->
							<label class="form-control col-span-2">
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
							</label>
							<!-- Condition -->
							<label class="form-control col-span-3">
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
							</label>
							<!-- Created -->
							<label class="form-control col-span-3 col-start-1">
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
							</label>
							<!-- Updated -->
							<label class="form-control col-span-3">
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
							</label>
						</div>
					</form>
				</div>
			{/if}
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={40}>
			<div class="container mx-auto">
				<div role="tablist" class="tabs tabs-bordered">
					<input
						type="radio"
						name="my_tabs_1"
						role="tab"
						class="tab"
						aria-label="Purchasing"
						checked
					/>
					<div role="tabpanel" class="tab-content">
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
									<input
										type="text"
										name="m_product_id"
										hidden
										bind:value={product.id}
										class="input input-bordered w-full"
										required
									/>
									<div class="overflow-x-auto">
										<table class="table table-sm">
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
						{/if}
					</div>

					<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Replenish" />
					<div role="tabpanel" class="tab-content my-4">
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
											<div class="rounded-md bg-base-300 p-4 shadow">
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
							<table class="table table-sm">
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
											<td>{findLabelByValue(warehouses, replenish.m_warehousesource_id) ?? ''}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{/if}
					</div>
				</div>
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
