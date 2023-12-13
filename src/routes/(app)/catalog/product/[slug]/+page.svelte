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
	const submit: SubmitFunction = ({ form, data, action, cancel }) => {
		let start = Date.now();
		return async ({ update, result }) => {
			console.log('1', Date.now() - start);

			if (result.type === 'success') {
				console.log('2', Date.now() - start);
				// do something...
				// do something...
				addToast({
					data: {
						title: 'Success',
						description: 'Product updated!',
						color: 'bg-green-500'
					}
				});
				console.log('3', Date.now() - start);
				// use the default behavior for this result type
				await applyAction(result);
				console.log('4', Date.now() - start);
				history.back();
				console.log('5', Date.now() - start);
			}
			//await update({ reset: false, invalidateAll: false });
			//	let timeTaken = Date.now() - start;
			//	console.log('Total time taken : ' + timeTaken + ' ms');
		};
	};
</script>

<div class="grid h-full grid-cols-[1fr_130ch_1fr]">
	<div class="card col-[2] w-full overflow-auto pt-12">
		<hgroup>
			<h3>Edit product</h3>
			<p>Some information about product</p>
		</hgroup>
		<Tabs tabs={['Profile', 'Pricelist', 'Images']}>
			<TabsContent key={'Profile'}>
				<form method="POST" action="?/setProduct" use:enhance>
					{#if product}
						<div class="grid grid-cols-2 items-start gap-2 p-2">
							<fieldset class="col-span-2">
								<!-- 	<div class="col-span-6 w-full"> -->
								<div>
									<label for="name">Name</label>
									<input
										id="name"
										name="name"
										type="text"
										placeholder="Enter email..."
										bind:value={product.name}
										required
									/>
								</div>
							</fieldset>
							<fieldset>
								<legend>Identification</legend>
								<div>
									<label for="id">ID</label>
									<input id="id" name="id" type="text" readonly value={product.id} />
								</div>
								<div>
									<label for="sku"> SKU</label>
									<input id="sku" name="sku" type="text" readonly bind:value={product.sku} />
								</div>
								<div>
									<label for="barcode">Barcode</label>
									<input id="barcode" name="barcode" type="text" bind:value={product.barcode} />
								</div>
							</fieldset>
							<fieldset>
								<legend>Vendor</legend>
								<div>
									<label for="uom">UoM</label>
									<input id="uom" name="c_uom_id" type="text" bind:value={product.c_uom_id} />
								</div>
								<div>
									<label for="brand">Brand</label>
									<input id="brand" name="brand" type="text" bind:value={product.brand} />
								</div>
								<div>
									<label for="mpn">MPN</label>
									<input
										id="mpn"
										name="mpn"
										type="text"
										bind:value={product.mpn}
										autocomplete="off"
									/>
								</div>
							</fieldset>
							<fieldset>
								<legend>Date/Time</legend>
								<div>
									<label for="created">Created</label>
									<input
										id="created"
										name="created"
										type="datetime"
										readonly
										value={DateTimeFormat(product.created)}
									/>
								</div>
								<div>
									<label for="updated">Updated</label>
									<input
										id="updated"
										name="updated"
										type="datetime"
										readonly
										value={DateTimeFormat(product.updated)}
									/>
								</div>
							</fieldset>
							<fieldset>
								<legend>Status</legend>
								<div>
									<label for="isselfservice">Is Self-service?</label>
									<input
										id="isselfservice"
										name="isselfservice"
										type="checkbox"
										checked={product.isselfservice}
									/>
								</div>
								<div>
									<label for="discontinued">Discontinued?</label><input
										type="checkbox"
										id="discontinued"
										name="discontinued"
										checked={product.discontinued}
									/>
								</div>
								<div>
									<label for="isactive">Is Active?</label><input
										type="checkbox"
										id="isactive"
										name="isactive"
										checked={product.isactive}
									/>
								</div>
							</fieldset>
							<fieldset>
								<div>
									<label for="condition">Condition</label><input
										id="condition"
										name="condition"
										type="text"
										class="input"
										bind:value={product.condition}
									/>
								</div>
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
							</fieldset>
							<footer class="col-start-2 col-end-3 flex justify-between">
								<menu>
									<button type="button" on:click={() => history.back()}>Back</button>
								</menu>
								<menu>
									<button type="reset">Cancel</button>
									<button type="submit" disabled={!modified}>Save</button>
								</menu>
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

<style lang="postcss">
	fieldset {
		max-inline-size: unset;
	}
	/* 	label {
		gap: unset;
	} */
</style>
