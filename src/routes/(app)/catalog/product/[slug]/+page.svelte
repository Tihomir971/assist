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

	export let data: PageData;
	$: ({ product, categories, pricelists, streamed } = data);
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
	const submit: SubmitFunction = ({}) => {
		return async ({ result }) => {
			if (result.type === 'success') {
				// do something...
				// do something...
				addToast({
					data: {
						title: 'Success',
						description: 'Product updated!',
						color: 'bg-green-500'
					}
				});
				// use the default behavior for this result type
				await applyAction(result);
				history.back();
			}
			//await update({ reset: false, invalidateAll: false });
			//	let timeTaken = Date.now() - start;
			//	console.log('Total time taken : ' + timeTaken + ' ms');
		};
	};
</script>

<div class="mx-auto max-w-2xl">
	<div class="card">
		<hgroup>
			<h3>Edit product</h3>
			<p>Some information about product</p>
		</hgroup>
		<Tabs tabs={['Profile', 'Pricelist', 'Images']}>
			<TabsContent key={'Profile'}>
				<form method="POST" action="?/setProduct" use:enhance={submit}>
					<div class="space-y-12">
						{#if product}
							<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
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
									<button type="button" on:click={() => history.back()} class="btn btn-outline"
										>Back</button
									>
									<button
										type="reset"
										disabled={!modified}
										class="btn btn-outline btn-secondary"
										on:click={() => (product = localCopy)}>Reset</button
									>
									<button type="submit" disabled={!modified} class="btn btn-primary">Save</button>
								</footer>
							</div>
							{#if categories}
								<!-- <div class="col-span-3">
										<label for="m_product_category_id"><span>Product category</label>
										<input
											name="m_product_category_id"
											hidden
											bind:value={product.m_product_category_id}
										/>
										<input
											type="search"
											name="label"
											bind:value={inputPopupLabel}
											placeholder="Choose category..."
											autocomplete="off"
											use:popup={{
												event: 'focus-click',
												target: 'categories',
												placement: 'bottom'
											}}
											on:change={() => {
												if (!inputPopupLabel) {
													inputPopupValue = null;
												}
											}}
										/>
										<div
											data-popup="categories"
											class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto"
											tabindex="-1"
										>
											<Autocomplete
												bind:input={inputPopupLabel}
												options={categories}
												on:selection={(e) => {
													inputPopupLabel = e.detail.label;
													product.m_product_category_id = Number(e.detail.value);
												}}
											/>
										</div>
									</div> -->
								<!-- <Combobox
									name="m_product_category_id"
									labelText="Product category"
									placeholder="Choose category"
									options={categories}
									bind:value={product.m_product_category_id}
								></Combobox> -->
							{/if}
							<!-- 	<input
										id="m_product_category_id"
										name="m_product_category_id"
										type="text"
										class="w-full"
										bind:value={product.m_product_category_id}
									/> -->

							<!--  -->
							<!-- on:click={() => (previousPage ? goto(previousPage) : history.back())}>Back</button -->
						{/if}
					</div>
				</form>
			</TabsContent>
			<TabsContent key={'Pricelist'}>
				{#if pricelists}
					<table class="w-full">
						<thead>
							<tr>
								<th>Partner</th>
								<!-- <th>id</th> -->
								<!-- <th>c_bpartner_id</th> -->
								<th>Partner PN</th>
								<th>Price</th>
								<th>url</th>
								<th>updated</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								{#each pricelists as pricelist}
									<td>{pricelist.c_bpartner[0]?.name}</td>
									<td>{pricelist.vendorproductno}</td>
									<!-- <td>{pricelist.id}</td> -->
									<!-- <td>{pricelist.c_bpartner_id}</td> -->
									<td>{numberFormat(pricelist.pricelist)}</td>
									<td><a href={pricelist.url} target="_blank">{pricelist.url} </a></td>
									<td>{DateTimeFormat(pricelist.updated)}</td>
								{/each}
							</tr>
						</tbody>
					</table>
				{/if}
			</TabsContent>
			<TabsContent key={'Images'}
				>{#await streamed.images then images}
					<!-- 	{#if images.imageURLs.length > 0}
						<Gallery images={images.imageURLs} />
						<Thumbnails images={images.imageURLs}></Thumbnails>
					{/if} -->
				{/await}</TabsContent
			>
		</Tabs>
	</div>
</div>
