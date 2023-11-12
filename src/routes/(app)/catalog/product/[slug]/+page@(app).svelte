<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Gallery, Thumbnails } from '$lib/components/gallery';
	import { DateTimeFormat } from '$lib/scripts/format';
	import { Autocomplete, popup } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { Tabs, TabsContent } from '$lib/components/tabs';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';

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

	let inputPopupLabel: string = '';
	let inputPopupValue: number | null = null;

	let tabSet: number = 0;
</script>

<div class="flex justify-center items-center h-full">
	<div class="card w-1/2 overflow-auto">
		<header class="flex justify-between items-center px-4 py-2">
			<h2>Edit product</h2>
		</header>
		<Tabs tabs={['Profile', 'Stock', 'Tab 3']}>
			<TabsContent key={'Profile'}
				><form
					method="POST"
					action="?/setProduct"
					use:enhance={() => {
						return async ({ update, result }) => {
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
						};
					}}
				>
					<div class="space-y-4 p-4">
						{previousPage}
						{#if product}
							<div class="wrapper">
								<label for="name">Name</label>
								<input
									id="name"
									name="name"
									type="text"
									class="input"
									required
									bind:value={product.name}
								/>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<section class="grid grid-cols-2 gap-2">
										<div class="wrapper">
											<label for="id">ID</label>
											<input
												id="id"
												name="id"
												type="text"
												class="input"
												readonly
												value={product.id}
											/>
										</div>
										<div class="wrapper">
											<label for="sku">SKU</label>
											<input
												id="sku"
												name="sku"
												type="text"
												class="input"
												readonly
												bind:value={product.sku}
											/>
										</div>
										<div class="wrapper">
											<label for="barcode">Barcode</label>
											<input
												id="barcode"
												name="barcode"
												type="text"
												class="input"
												bind:value={product.barcode}
											/>
										</div>
										<div class="wrapper">
											<label for="c_uom_id">UOM</label>
											<input
												id="c_uom_id"
												name="c_uom_id"
												type="text"
												class="input"
												bind:value={product.c_uom_id}
											/>
										</div>
										<div class="wrapper">
											<label for="brand">Brand</label>
											<input
												id="brand"
												name="brand"
												type="text"
												class="input"
												bind:value={product.brand}
											/>
										</div>
										<div class="wrapper">
											<label for="mpn">MPN</label>
											<input
												id="mpn"
												name="mpn"
												type="text"
												class="input"
												bind:value={product.mpn}
												autocomplete="off"
											/>
										</div>
										<div class="wrapper">
											<label for="created">Created</label>
											<input
												id="created"
												name="created"
												type="text"
												class="input"
												readonly
												value={DateTimeFormat(product.created)}
											/>
										</div>
										<div class="wrapper">
											<label for="updated">Updated</label>
											<input
												id="updated"
												name="updated"
												type="text"
												class="input"
												readonly
												value={DateTimeFormat(product.updated)}
											/>
										</div>
										<div>
											{#if categories}
												<div class="wrapper">
													<label for="m_product_category_id">Product category</label>
													<input
														name="m_product_category_id"
														hidden
														bind:value={product.m_product_category_id}
													/>
													<input
														class="input"
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
												</div>
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
										</div>
										<div class="wrapper">
											<label for="condition">Condition</label>
											<input
												id="condition"
												name="condition"
												type="text"
												class="input"
												bind:value={product.condition}
											/>
										</div>
									</section>
									<div class="grid grid-cols-3 gap-2 p-2">
										<div>
											<input
												type="checkbox"
												id="isselfservice"
												name="isselfservice"
												checked={product.isselfservice}
											/>
											<label for="isselfservice">Is Self-service?</label>
										</div>
										<div>
											<input
												type="checkbox"
												id="discontinued"
												name="discontinued"
												checked={product.discontinued}
											/>
											<label for="discontinued">Is Discontinued?</label>
										</div>
										<div>
											<input
												type="checkbox"
												id="isactive"
												name="isactive"
												checked={product.isactive}
											/>
											<label for="isactive">Is Active?</label>
										</div>
									</div>
								</div>
								{#await streamed.images then images}
									{#if images.imageURLs.length > 0}
										<Gallery images={images.imageURLs} />
										<Thumbnails images={images.imageURLs}></Thumbnails>
									{/if}
								{/await}
							</div>
						{/if}
					</div>
					<div class="flex justify-end w-full gap-2 px-4 py-2 border-t">
						<button type="reset" class="btn variant-filled-surface" on:click={() => history.back()}
							>Back</button
						>
						<!-- on:click={() => (previousPage ? goto(previousPage) : history.back())}>Back</button -->
						<button type="submit" class="btn variant-filled-primary" disabled={!modified}
							>Save</button
						>
					</div>
				</form></TabsContent
			>
			<TabsContent key={'Stock'}>Stock</TabsContent>
			<TabsContent key={'Tab 3'}>Tab 3</TabsContent>
		</Tabs>
	</div>
</div>
