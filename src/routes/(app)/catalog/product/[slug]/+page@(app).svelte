<script lang="ts">
	import type { PageData, SubmitFunction } from './$types';
	import { applyAction, enhance } from '$app/forms';
	import { afterNavigate, goto, invalidate } from '$app/navigation';
	import { base } from '$app/paths';
	import { DateTimeFormat, numberFormat } from '$lib/scripts/format';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { Combobox } from '$lib/components/combobox';
	import { Link, Plus, Search, X } from 'lucide-svelte';
	import { Drawer } from '$lib/components/drawer';
	import { melt } from '@melt-ui/svelte';
	import { Dialog } from '$lib/components/dialog';
	import { findLabelByValue } from '$lib/scripts/objects';
	//import { findProductOnWeb } from '$lib/server/scraper';

	export let data: PageData;
	$: ({ product, categories, pricelists, supabase, bpartners, replenishes, warehouses } = data);
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

	let columns = ['Partner', 'Partner PN', 'Price', 'Updated', 'URL'];
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
		let selectedLabel = bpartners?.find(
			(partner) => partner.value === Number(selectedValue)
		)?.label;
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
</script>

<div class="mx-auto flex h-full max-w-5xl flex-col">
	<div class="flex w-full items-center justify-between pt-4">
		<hgroup class="prose">
			<h3>Edit product</h3>
			<p>Detailed information about product</p>
		</hgroup>
		<button type="button" on:click={() => history.back()} class="btn btn-outline">Back</button>
	</div>
	<div class="divider my-2"></div>
	{#if product}
		<div class="w-full flex-grow overflow-hidden">
			<form
				method="post"
				action="?/updateProduct"
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
				class="flex h-full w-full flex-col"
			>
				<div class="flex items-center justify-between gap-x-6 pb-2">
					<button type="submit" formaction="?/deleteProduct" class="btn btn-warning">Delete</button>
					<div>
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
								class="btn btn-square join-item"><Link /></a
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
	<div class="divider my-2"></div>
	<div class="min-h-64">
		<div role="tablist" class="tabs tabs-bordered">
			<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Prices" checked />
			<div role="tabpanel" class="tab-content">
				{#if pricelists && product}
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
										{#each pricelists as pricelist}
											<tr class="hover">
												<td>{pricelist.c_bpartner?.name}</td>
												<td>{pricelist.vendorproductno}</td>
												<td>{numberFormat(pricelist.pricelist)}</td>
												<td>{DateTimeFormat(pricelist.updated)}</td>
												<td
													><a href={pricelist.url} target="_blank" class="btn btn-square btn-xs"
														><Link /></a
													></td
												>
												<td>
													<button
														on:click={() => deleteProductPORow(pricelist.id)}
														class="btn btn-ghost btn-sm"
													>
														<X />
													</button>
												</td>
											</tr>
										{/each}
										<tr>
											<td class="px-0">
												<select
													name="bpartner"
													class="select select-bordered select-sm w-full max-w-xs"
													required
													>{#if bpartners}
														{#each bpartners as { value, label }}
															<option {value}>{label}</option>
														{/each}
													{/if}
												</select>
											</td>
											<td
												><input
													type="text"
													name="partnerPN"
													class="input input-bordered input-sm max-w-xs"
													bind:value={newPartnerPN}
												/></td
											>
											<td colspan="3">
												<input
													type="url"
													name="url"
													placeholder="Enter URL..."
													class="input input-bordered input-sm w-full"
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
															<Search />
														{/if}
													</button>
												{:else}
													<button
														type="submit"
														disabled={addingProductPO}
														class="btn btn-ghost btn-sm"><Plus /></button
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
									action="?/createReplenish"
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
												<select name="m_warehouse_id" class="select select-bordered w-full" required
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
												<select name="m_warehousesource_id" class="select select-bordered w-full"
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
</div>
<!-- 
<Drawer.Content name="settings" let:title let:description let:close>
	<h2 class="font-bold" use:melt={title}>Add replenich quantities</h2>
	<p use:melt={description}>Placeholder description</p>
	<div class="flex">
		<button class="btn ml-auto mt-4" use:melt={close}> Close </button>
	</div>
</Drawer.Content>
 -->
