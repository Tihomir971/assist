<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_BEARER_TOKEN } from '$env/static/public';
	import { Euro, Factory } from 'lucide-svelte';
	import * as api from '$lib/api';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let selectedProducts: number[];
	export let onStock: boolean = true;
	export let filterValue: string;
	async function getPrices() {
		await api.getPrices(selectedProducts).then((data) => {
			if (data) {
				addToast({
					data: {
						title: 'Prices updated!',
						description: data,
						color: 'bg-green-500'
					}
				});
			}
		});
		/*	const apiUrl = 'http://192.168.1.10:4443/cenoteka/prods';
	const myHeaders = new Headers({ Authorization: 'Bearer ' + PUBLIC_BEARER_TOKEN });
		const formData = new FormData();
		formData.append('prods', JSON.stringify(selectedProducts));

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				body: formData,
				headers: myHeaders
			});
			if (!response.ok) {
				throw new Error(`Network response was not OK: ${response.statusText}`);
			}

			const data = await response.text();
		} catch (error) {
			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				console.error('Failed to fetch:', error.message);
			} else {
				console.error('There has been a problem with your fetch operation:', error);
			}
		} */
	}

	async function getERP() {
		const apiUrl = 'http://192.168.1.10:4443/bizsoft/assistant/sync/prods';
		const myHeaders = new Headers({ Authorization: 'Bearer ' + PUBLIC_BEARER_TOKEN });
		const formData = new FormData();
		formData.append('prods', JSON.stringify(selectedProducts));

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				body: formData,
				headers: myHeaders
			});
			if (!response.ok) {
				throw new Error(`Network response was not OK: ${response.statusText}`);
			}

			const data = await response.text();
		} catch (error) {
			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				console.error('Failed to fetch:', error.message);
			} else {
				console.error('There has been a problem with your fetch operation:', error);
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
				type="text"
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
		<button on:click={getPrices} class="btn btn-neutral">
			<Euro size="24" />
			Get prices
		</button>
		<button on:click={getERP} class="btn btn-neutral">
			<Factory class="size-5" />
			Get ERP
		</button>
	</div>
</div>
