<script lang="ts">
	import * as api from '$lib/api';
	import { toast } from 'svelte-sonner';

	import { invalidate } from '$app/navigation';
	export let selectedProducts: number[];

	async function getPrices() {
		for (let index = 0; index < selectedProducts.length; index++) {
			const element = selectedProducts[index];

			const response = await fetch(`/api/scraper/getPrice2/${element}`);
			const serverResponse = await response.json();

			if (serverResponse.code === 'warning') {
				toast.warning('Market Prices Warning', {
					description: `${serverResponse.message}`
				});
			} else {
				toast.success('Market Prices updated', {
					description: `Market  price for "${serverResponse.message}" updated`
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
					toast.success('ERP Prices updated!', {
						description: data
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
			fetch(`/api/erp/getProduct?ID=${item}`).then((response) => {
				if (response.status === 200) {
					toast.success('ERP Prices updated!', {
						description: `ERP price for "${item}" updated`
					});
				}
			});
			console.log(item);
		}
		invalidate('catalog:products');
	}
</script>

<div class="navbar bg-base-100">
	<div class="flex-none gap-2">
		<!-- <button on:click={addToBasket} class="btn btn-neutral">
			<iconify-icon icon="ph:currency-eur" width="24" height="24"></iconify-icon>
			Add to Basket
		</button> -->
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
