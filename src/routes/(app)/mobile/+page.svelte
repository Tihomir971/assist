<script lang="ts">
	import { onMount } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	import { Button } from '$lib/components/ui/button/index.js';
	import { LocalStorage } from '$lib/storage.svelte';
	import type { CartItem } from '$lib/components/cart/types';

	type ProductGTIN = {
		gtins: string[];
		m_product: {
			id: number;
			name: string;
			description: string | null;
			sku: string | null;
		} | null;
		storage_info: {
			qtyonhand: number;
			m_warehouse: {
				name: string;
			} | null;
		}[];
	};

	let { data } = $props();
	let { supabase } = $derived(data);

	let scanResult: string | null = $state(null);
	let productInfo: ProductGTIN | null = $state(null);
	let html5QrCode: Html5Qrcode;
	let isScanning = $state(false);
	let skuSearch = $state('');
	let addingToCart = $state(false);

	const shoppingCartState = new LocalStorage<CartItem[]>('cartItems', []);
	console.log('shoppingCartState', shoppingCartState);
	$inspect('shoppingCartState', shoppingCartState.current);
	onMount(() => {
		html5QrCode = new Html5Qrcode('qr-reader');
	});

	async function startScanning() {
		try {
			await html5QrCode.start(
				{ facingMode: 'environment' },
				{ fps: 10, qrbox: { width: 250, height: 250 } },
				onScanSuccess,
				onScanFailure
			);
			isScanning = true;
		} catch (err) {
			console.error('Failed to start scanning:', err);
		}
	}

	async function stopScanning() {
		if (html5QrCode && isScanning) {
			try {
				await html5QrCode.stop();
				isScanning = false;
			} catch (err) {
				console.error('Failed to stop scanning:', err);
			}
		}
	}

	async function onScanSuccess(decodedText: string) {
		scanResult = decodedText;
		await checkProduct(decodedText);
		await stopScanning();
	}

	function onScanFailure(error: string) {
		console.warn(`QR code scanning failed: ${error}`);
	}

	async function checkProduct(barcode: string) {
		const { data, error } = await supabase
			.from('m_product_gtin')
			.select(
				'm_product!inner(id,name,description,sku,m_product_gtin(gtin),m_storageonhand(qtyonhand,m_warehouse(name)))'
			)
			.eq('gtin', barcode)
			.single();

		if (error) {
			console.error('Error checking product:', error);
			alert('Failed to check product. Please try again.');
			productInfo = null;
			return;
		}

		if (data) {
			productInfo = {
				gtins: data.m_product.m_product_gtin.map((g) => g.gtin ?? ''),
				m_product: data.m_product
					? {
							id: data.m_product.id,
							name: data.m_product.name,
							description: data.m_product.description,
							sku: data.m_product.sku
						}
					: null,
				storage_info: data.m_product.m_storageonhand.map((storage) => ({
					qtyonhand: storage.qtyonhand ?? 0,
					m_warehouse: storage.m_warehouse
						? {
								name: storage.m_warehouse.name
							}
						: null
				}))
			};
			console.log('Product Info:', productInfo);
		} else {
			alert('Product not found');
			productInfo = null;
		}
	}

	async function handleSkuSearch() {
		if (skuSearch) {
			const { data, error } = await supabase
				.from('m_product')
				.select(
					`
					id,
					name,
					description,
					sku,
					m_product_gtin (
						gtin
					),
					m_storageonhand (
						qtyonhand,
						m_warehouse (
							name
						)
					)
				`
				)
				.eq('sku', skuSearch)
				.single();

			if (error) {
				console.error('Error searching product by SKU:', error);
				alert('Failed to search product. Please try again.');
				productInfo = null;
				return;
			}

			if (data) {
				productInfo = {
					gtins: data.m_product_gtin.map((g) => g.gtin ?? ''),
					m_product: data
						? {
								id: data.id,
								name: data.name,
								description: data.description,
								sku: data.sku
							}
						: null,
					storage_info: data.m_storageonhand.map((storage) => ({
						qtyonhand: storage.qtyonhand ?? 0,
						m_warehouse: storage.m_warehouse
							? {
									name: storage.m_warehouse.name
								}
							: null
					}))
				};
				console.log('productInfo', productInfo);
			} else {
				alert('Product not found');
				productInfo = null;
			}
		}
	}

	async function addToCart() {
		if (productInfo && productInfo.m_product && !addingToCart) {
			addingToCart = true;
			try {
				shoppingCartState.current.push({
					id: productInfo.m_product.id,
					name: productInfo.m_product.name,
					quantity: 1,
					sku: productInfo.m_product.sku
				});
				alert('Product added to cart');
			} catch (error) {
				console.error('Error adding product to cart:', error);
				alert('Failed to add product to cart. Please try again.');
			} finally {
				setTimeout(() => {
					addingToCart = false;
				}, 1000);
			}
		}
	}
</script>

<svelte:head>
	<title>Mobile Barcode Scanner</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<div class="flex-1 overflow-y-auto pb-20">
		<div class="p-4">
			<h1 class="mb-4 text-2xl font-bold">Mobile Barcode Scanner</h1>

			<div id="qr-reader" class="mb-4"></div>

			{#if scanResult}
				<p class="mb-2">Scanned barcode: {scanResult}</p>
			{/if}

			{#if productInfo}
				<div class="rounded shadow">
					<p class="mb-2">SKU: {productInfo.m_product?.sku ?? 'N/A'}</p>
					<h2 class="mb-2 text-xl font-semibold">
						{productInfo.m_product?.name ?? 'Unknown Product'}
					</h2>
					<h3 class="mb-2 text-lg font-semibold">GTINs:</h3>
					<ul class="mb-4 list-disc pl-5">
						{#each productInfo.gtins as gtin}
							<li>{gtin}</li>
						{/each}
					</ul>

					<h3 class="mb-2 text-lg font-semibold">Storage Information:</h3>
					{#if productInfo.storage_info.length > 0}
						<div class="overflow-x-auto">
							<table class="w-full border-collapse border border-gray-300">
								<thead>
									<tr class="bg-gray-500">
										<th class="border border-gray-300 p-2 text-left">Warehouse</th>
										<th class="border border-gray-300 p-2 text-left">Quantity on Hand</th>
									</tr>
								</thead>
								<tbody>
									{#each productInfo.storage_info as storage}
										{#if storage.qtyonhand > 0 && storage.m_warehouse}
											<tr>
												<td class="border border-gray-300 p-2">{storage.m_warehouse.name}</td>
												<td class="border border-gray-300 p-2">{storage.qtyonhand}</td>
											</tr>
										{/if}
									{/each}
								</tbody>
							</table>
						</div>
						<p class="mt-4">
							Description: {productInfo.m_product?.description}
						</p>
					{:else}
						<p>No storage information available.</p>
					{/if}

					<Button onclick={addToCart} class="mt-4" disabled={addingToCart}>
						{addingToCart ? 'Adding...' : 'Add to Cart'}
					</Button>
				</div>
			{:else if scanResult}
				<p>No product found for this barcode.</p>
			{/if}
		</div>
	</div>

	<div class="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white p-2">
		<div class="flex h-12 items-stretch">
			<input
				type="text"
				bind:value={skuSearch}
				placeholder="Search by SKU"
				class="w-1/2 rounded-l border border-r-0 p-2 text-sm"
			/>
			<div class="flex w-1/2">
				<button
					onclick={handleSkuSearch}
					class="flex-1 border-r border-white bg-purple-500 px-2 py-2 text-sm text-white"
				>
					Search
				</button>
				{#if !isScanning}
					<button
						onclick={startScanning}
						class="flex-1 rounded-r bg-blue-500 px-2 py-2 text-sm text-white"
					>
						Scan
					</button>
				{:else}
					<button
						onclick={stopScanning}
						class="flex-1 rounded-r bg-red-500 px-2 py-2 text-sm text-white"
					>
						Stop
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-y: auto;
		height: 100%;
	}
</style>
