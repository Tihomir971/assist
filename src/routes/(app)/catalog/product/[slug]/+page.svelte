<script lang="ts">
	import type { PageData, SubmitFunction } from './$types';
	import { applyAction, enhance } from '$app/forms';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Gallery, Thumbnails } from '$lib/components/gallery';
	import { DateTimeFormat, numberFormat } from '$lib/scripts/format';
	import { Tabs, TabsContent } from '$lib/components/tabs';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { Combobox } from '$lib/components/combobox';
	import { X } from 'lucide-svelte';
	import { Label, Select } from '$lib/components/select';

	export let data: PageData;
	$: ({ product, categories, pricelists, streamed, bpartners } = data);
	let localCopy: any = undefined;
	let modified = false;
	$: if (localCopy && JSON.stringify(product) !== JSON.stringify(localCopy)) {
		modified = true;
	} else {
		modified = false;
	}
	let previousPage: string = base;
	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
		previousPage = previousPage + '?' + from?.url.searchParams.toString() || previousPage;
		localCopy = Object.assign({}, product);
	});
	const updateProduct: SubmitFunction = ({}) => {
		return async ({ result }) => {
			if (result.type === 'success') {
				// do something...
				// do something...
				addToast({
					data: {
						title: 'Product update',
						description: `Product: "${product?.name}" successfully updated!`,
						color: 'alert-success'
					}
				});
				// use the default behavior for this result type
				await applyAction(result);
			}
			history.back();
			//await update({ reset: false, invalidateAll: false });
			//	let timeTaken = Date.now() - start;
			//	console.log('Total time taken : ' + timeTaken + ' ms');
		};
	};
	let columns = ['Partner', 'Partner PN', 'Price', 'URL', 'Updated'];
	let newRow = [...columns];
	function addRow() {
		//		data = [...data, [...newRow]]
		//		newRow = columns
	}
	function deleteRow(rowToBeDeleted) {
		console.log('rowToBeDeleted', JSON.stringify(rowToBeDeleted, null, 2));

		//	data = data.filter(row => row != rowToBeDeleted)
	}
</script>

<div class="mx-auto mb-4 mt-4 max-w-5xl space-y-4">
	<div class="flex items-center justify-between">
		<hgroup>
			<h3>Edit product</h3>
			<p>Some information about product</p>
		</hgroup>
		<button type="button" on:click={() => history.back()} class="btn btn-outline">Back</button>
	</div>
	<div role="tablist" class="tabs tabs-bordered">
		<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Profile" checked />
		<div role="tabpanel" class="tab-content my-4">
			<form method="POST" action="?/updateProduct" use:enhance={updateProduct}>
				<div class="space-y-12">
					{#if product}
						<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
							<label class="form-control col-span-2 col-start-1">
								<div class="label">
									<span class="label-text">ID</span>
								</div>
								<input
									name="id"
									type="text"
									readonly
									value={product.id}
									class="input input-bordered w-full"
								/>
							</label>

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
							<label class="form-control col-span-2">
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
							<label class="form-control col-span-full">
								<div class="label">
									<span class="label-text">Name</span>
								</div>
								<input
									name="name"
									type="text"
									placeholder="Enter name..."
									bind:value={product.name}
									required
									class="input input-bordered w-full"
								/>
							</label>
							<label class="form-control col-span-full">
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
							<label class="form-control col-span-3 col-start-1">
								<div class="label">
									<span class="label-text">Created</span>
								</div>
								<input
									name="created"
									type="datetime"
									readonly
									value={DateTimeFormat(product.created)}
									class="input input-bordered w-full"
								/>
							</label>
							<label class="form-control col-span-3">
								<div class="label">
									<span class="label-text">Updated</span>
								</div>
								<input
									name="updated"
									type="datetime"
									readonly
									value={DateTimeFormat(product.updated)}
									class="input input-bordered w-full"
								/>
							</label>
							<label class="col-span-2 flex cursor-pointer items-center gap-x-3">
								<input
									name="isselfservice"
									type="checkbox"
									checked={product.isselfservice}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Is Self-service?</span>
							</label>
							<label class="col-span-2 flex cursor-pointer items-center gap-x-3">
								<input
									type="checkbox"
									name="discontinued"
									checked={product.discontinued}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Discontinued?</span>
							</label>
							<label class="col-span-2 flex cursor-pointer items-center gap-x-3">
								<input
									type="checkbox"
									name="isactive"
									checked={product.isactive}
									class="toggle toggle-primary"
								/>
								<span class="label-text">Is Active?</span>
							</label>
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
							<!-- name="m_product_category_id"
							labelText="Product category"
							placeholder="Choose category"
							options={categories}
							bind:value={product.m_product_category_id} -->
							{#if categories}
								<Combobox
									labela="Category"
									name="m_product_category_id"
									options={categories}
									bind:value={product.m_product_category_id}
								></Combobox>
							{/if}

							<footer class="col-span-full flex items-center justify-end gap-x-6">
								<button
									type="reset"
									disabled={!modified}
									class="btn btn-outline btn-secondary"
									on:click={() => (product = localCopy)}>Reset</button
								>
								<button type="submit" disabled={!modified} class="btn btn-primary">Save</button>
							</footer>
						</div>
					{/if}
				</div>
			</form>
		</div>

		<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Prices" />
		<div role="tabpanel" class="tab-content my-4">
			{#if pricelists}
				<div class="col-span-full w-full">
					<table class="table">
						<thead>
							<tr>
								{#each columns as column}
									<th>{column}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each pricelists as pricelist}
								<tr class="hover">
									<td> {pricelist.c_bpartner?.name}</td>
									<td>{pricelist.vendorproductno}</td>
									<td>{numberFormat(pricelist.pricelist)}</td>
									<td><a href={pricelist.url} target="_blank">{pricelist.url} </a></td>
									<td>{DateTimeFormat(pricelist.updated)}</td>
									<td>
										<button on:click={() => deleteRow(pricelist)} class="btn btn-ghost btn-sm"
											><X /></button
										></td
									>
								</tr>
							{/each}
						</tbody>
					</table>
					<div class="flex flex-row items-center justify-start space-x-4 border-t pt-4">
						<div>Add new:</div>
						{#if bpartners}
							<Select options={bpartners} label="Select Partner..."></Select>
						{/if}
						<label class="form-control col-span-3">
							<div class="label">
								<span class="label-text">Partner PN</span>
							</div>
							<input type="text" class="input input-bordered max-w-xs" />
						</label>
						<label class="form-control col-span-3">
							<div class="label">
								<span class="label-text">Partner PN</span>
							</div>
							<input type="url" placeholder="Enter URL..." class="input input-bordered max-w-xs" />
						</label>
						<Label label="Partner"></Label>
						<button type="submit" class="btn btn-secondary">Add</button>
					</div>
				</div>
			{/if}
		</div>

		<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Images" />
		<div role="tabpanel" class="tab-content my-4">Tab content 3</div>
	</div>
</div>
