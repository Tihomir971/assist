<script lang="ts">
	import { page } from '$app/stores';
	import { Euro, Factory, TheaterIcon } from 'lucide-svelte';
	import * as api from '$lib/api';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { browser } from '$app/environment';
	import { goto, invalidate } from '$app/navigation';

	export let selectedProducts: number[];
	export let onStock: boolean = true;
	export let filterValue: string;

	async function getPrices() {
		for (let index = 0; index < selectedProducts.length; index++) {
			const element = selectedProducts[index];

			const response = await fetch(`/api/scraper/getPrice/${element}`);
			const serverResponse = await response.json();

			if (serverResponse.error) {
				addToast({
					data: {
						title: `${serverResponse.error.message}`,
						description: `${serverResponse.error.details}`,
						color: 'alert-error',
						closeDelay: 0
					}
				});
			} else {
				addToast({
					data: {
						title: 'Market Prices updated!',
						description: `Market  price for "${serverResponse.name}" updated`,
						color: 'alert-success',
						closeDelay: 2000
					}
				});
			}
		}
		invalidate('catalog:products');
	}
	async function getERP() {
		console.log('selectedProducts', JSON.stringify(selectedProducts));
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
	async function addToBasket() {
		const apiUrl = '/api/basket/add/';
		console.log('selectedProducts', JSON.stringify(selectedProducts));

		for (let index = 0; index < selectedProducts.length; index++) {
			console.log('selectedProduct', selectedProducts[index]);

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
			<Euro size="24" />
			Add to Basket
		</button>
		<button on:click={getPrices} class="btn btn-neutral">
			<Euro size="24" />
			Get Prices
		</button>
		<button on:click={getERP} class="btn btn-neutral">
			<Factory class="size-5" />
			Get ERP
		</button>
	</div>
</div>
