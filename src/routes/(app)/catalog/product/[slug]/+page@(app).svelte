<script lang="ts">
	import type { PageData } from './$types';
	import { applyAction, enhance } from '$app/forms';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Gallery, Thumbnails } from '$lib/components/gallery';
	import { DateTimeFormat } from '$lib/scripts/format';
	import { Tabs, TabsContent } from '$lib/components/tabs';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { Combobox, Label } from '$lib/components/combobox';

	export let data: PageData;
	$: ({ product, categories, streamed } = data);
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
</script>

<div class="grid h-full grid-cols-[1fr_130ch_1fr]">
	<div class="card overflow-auto col-[2] w-full pt-12">
		<hgroup>
			<h3>Edit product</h3>
			<p>Some information about product</p>
		</hgroup>
		<Tabs tabs={['Profile', 'Stock', 'Images']}>
			<TabsContent key={'Profile'}>
				<form
					method="POST"
					action="?/setProduct"
					use:enhance={() => {
						return async ({ update, result }) => {
							let start = Date.now();
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
							}
							update({ reset: false });
							let timeTaken = Date.now() - start;
							console.log('Total time taken : ' + timeTaken + ' ms');
						};
					}}
				>
					{#if product}
						<div class="grid grid-cols-2 gap-2 items-start p-2">
							<fieldset class="col-span-2">
								<!-- 	<div class="col-span-6 w-full"> -->
								<label
									><span>Name</span><input
										id="name"
										name="name"
										type="text"
										required
										bind:value={product.name}
									/></label
								>
								<!-- 	</div> -->
							</fieldset>
							<fieldset>
								<legend>Identification</legend>
								<label
									><span>ID</span><input
										id="id"
										name="id"
										type="text"
										readonly
										value={product.id}
									/></label
								>
								<label>
									<span>SKU</span>
									<input id="sku" name="sku" type="text" readonly bind:value={product.sku} />
								</label>

								<label
									><span>Barcode</span>
									<input id="barcode" name="barcode" type="text" bind:value={product.barcode} />
								</label>
							</fieldset>
							<fieldset>
								<legend>Vendor</legend>
								<label>
									<span>UoM</span>
									<input id="c_uom_id" name="c_uom_id" type="text" bind:value={product.c_uom_id} />
								</label>
								<label>
									<span>Brand</span>
									<input id="brand" name="brand" type="text" bind:value={product.brand} />
								</label>
								<label>
									<span>MPN</span>
									<input
										id="mpn"
										name="mpn"
										type="text"
										bind:value={product.mpn}
										autocomplete="off"
									/>
								</label>
							</fieldset>
							<fieldset>
								<legend>Date/Time</legend>
								<label
									><span>Created</span><input
										id="created"
										name="created"
										type="datetime"
										readonly
										value={DateTimeFormat(product.created)}
									/></label
								><label
									><span>Updated</span><input
										id="updated"
										name="updated"
										type="datetime"
										readonly
										value={DateTimeFormat(product.updated)}
									/></label
								>
							</fieldset>
							<fieldset>
								<legend>Status</legend>
								<label
									><span>Is Self-service?</span><input
										type="checkbox"
										id="isselfservice"
										name="isselfservice"
										checked={product.isselfservice}
									/></label
								>
								<label
									><span>Discontinued?</span><input
										type="checkbox"
										id="discontinued"
										name="discontinued"
										checked={product.discontinued}
									/></label
								>
								<label
									><span>Is Active?</span><input
										type="checkbox"
										id="isactive"
										name="isactive"
										checked={product.isactive}
									/></label
								>
							</fieldset>
							<fieldset>
								<label
									><span>Condition</span><input
										id="condition"
										name="condition"
										type="text"
										class="input"
										bind:value={product.condition}
									/></label
								>
								<!-- name="m_product_category_id"
							labelText="Product category"
							placeholder="Choose category"
							options={categories}
							bind:value={product.m_product_category_id} -->
								{#if categories}
									<Combobox
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
			<TabsContent key={'Stock'}>Stock</TabsContent>
			<TabsContent key={'Images'}
				>{#await streamed.images then images}
					{#if images.imageURLs.length > 0}
						<Gallery images={images.imageURLs} />
						<Thumbnails images={images.imageURLs}></Thumbnails>
					{/if}
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
