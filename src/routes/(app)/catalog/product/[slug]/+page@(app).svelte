<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Gallery, Thumbnails } from '$lib/components/gallery';
	// import { Combobox } from '$lib/components/melt-ui';
	import { DateTimeFormat } from '$lib/scripts/format';
	import { Autocomplete, popup, TabGroup, type PopupSettings, Tab } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';

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

<div class="card container overflow-auto">
	<TabGroup>
		<Tab bind:group={tabSet} name="tab1" value={0}>
			<span>Profile</span>
		</Tab>
		<Tab bind:group={tabSet} name="tab2" value={1}>Stock</Tab>
		<Tab bind:group={tabSet} name="tab3" value={2}>(label 3)</Tab>
		<!-- Tab Panels --->
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				<form
					method="POST"
					action="?/setProduct"
					use:enhance={() => {
						return async ({ update }) => {
							update({ reset: false });
						};
					}}
				>
					<header class="flex justify-between">
						<h3 class="title">Edit product</h3>
						<div class="flex gap-2">
							<button
								type="reset"
								class="btn variant-filled-surface"
								on:click={() => history.back()}>Back</button
							>
							{modified}
							<button type="submit" class="btn variant-filled-primary" disabled={!modified}
								>Save</button
							>
						</div>
					</header>
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
				</form>
			{:else if tabSet === 1}
				(tab panel 2 contents)
			{:else if tabSet === 2}
				(tab panel 3 contents)
			{/if}
		</svelte:fragment>
	</TabGroup>
</div>
