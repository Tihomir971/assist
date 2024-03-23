<script lang="ts">
	import { page } from '$app/stores';
	import * as api from '$lib/api';
	//	import * as erp from '$lib/api/erp';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { browser } from '$app/environment';
	import { goto, invalidate } from '$app/navigation';
	//	import { enhance } from '$app/forms';

	export let selectedProducts: number[];
	export let onStock: boolean = true;
	export let filterValue: string;

	async function getPrices() {
		for (let index = 0; index < selectedProducts.length; index++) {
			const element = selectedProducts[index];

			const response = await fetch(`/api/scraper/getPrice2/${element}`);
			const serverResponse = await response.json();

			if (serverResponse.code === 'warning') {
				addToast({
					data: {
						title: 'Market Prices Warning',
						description: `${serverResponse.message}`,
						color: 'alert-warning',
						closeDelay: 0
					}
				});
			} else {
				addToast({
					data: {
						title: 'Market Prices updated!',
						description: `Market  price for "${serverResponse.message}" updated`,
						color: 'alert-success',
						closeDelay: 2000
					}
				});
			}
		}
		invalidate('catalog:products');
	}
	async function getERP() {
		api
			.getERP(selectedProducts)
			.then((data) => {
				console.log('data', data);

				if (data) {
					addToast({
						data: {
							title: 'ERP Prices updated!',
							description: data,
							color: 'alert-success'
						}
					});
				}
				invalidate('catalog:products');
			})
			.catch((error) => {
				console.error(`Could not get products: ${error}`);
			});
	}
	async function getERPnew() {
		for (const item of selectedProducts) {
			fetch(`/api/erp/getProduct/${item}`).then((response) => {
				if (response.status === 200) {
					addToast({
						data: {
							title: 'ERP Prices updated!',
							description: `ERP price for "${item}" updated`,
							color: 'alert-success'
						}
					});
				}
			});
			console.log(item);
		}
	}
	async function addToBasket() {
		const apiUrl = '/api/basket/add/';

		for (let index = 0; index < selectedProducts.length; index++) {
			try {
				const response = await fetch(apiUrl, {
					method: 'POST',
					body: JSON.stringify({ id: selectedProducts[index] }),
					headers: {
						'content-type': 'application/json'
					}
				});

				if (response.status === 200) {
					addToast({
						data: {
							title: 'Add product to basket',
							description: `Product added to basket!`,
							color: 'alert-success'
						}
					});
				} else if (response.status === 204) {
					addToast({
						data: {
							title: 'Add product to basket',
							description: `Error adding to basket`,
							color: 'alert-info'
						}
					});
				}
			} catch (error) {
				console.log('error', error);
			}
		}
	}
	const onStockChange = () => {
		const newUrl = new URL($page.url);
		onStock = !onStock;
		newUrl?.searchParams?.set('onStock', onStock.toString());

		if (browser) {
			goto(`${newUrl.origin}/catalog${newUrl.search}`);
		}
		return;
	};
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<div class="form-control">
			<input
				type="search"
				bind:value={filterValue}
				placeholder="Search products..."
				class="input input-bordered"
			/>
		</div>
	</div>
	<div class="flex-none gap-2">
		<label class="flex items-center gap-2">
			<span>On Stock:</span>
			<input
				type="checkbox"
				role="switch"
				checked={onStock}
				on:change={onStockChange}
				class="toggle toggle-primary"
			/>
		</label>
		<button on:click={addToBasket} class="btn btn-neutral">
			<iconify-icon icon="ph:currency-eur" width="24" height="24"></iconify-icon>
			Add to Basket
		</button>
		<button on:click={getPrices} class="btn btn-neutral">
			<iconify-icon icon="ph:currency-eur" width="24" height="24"></iconify-icon>
			Get Prices
		</button>
		<button type="button" on:click={getERPnew} class="btn btn-neutral">
			<iconify-icon icon="ph:factory" width="24" height="24"></iconify-icon>
			Get ERP
		</button>
	</div>
</div>
