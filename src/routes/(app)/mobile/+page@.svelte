<script lang="ts">
	import { onMount } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	import { Button } from '$lib/components/ui/button/index.js';
	import { LocalStorage } from '$lib/storage.svelte';
	import type { CartItem } from '$lib/components/cart/types';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm, type FormResult } from 'sveltekit-superforms/client';
	import type { ActionData } from './$types.js';

	let { data } = $props();
	const { form, enhance } = superForm(data.form, {
		onUpdate({ result }) {
			const action = result.data as FormResult<ActionData>;

			if (data && action.products) {
				products = action.products;
				message = action.message;
			}
		}
	});

	let scanResult: string | null = $state(null);
	let html5QrCode: Html5Qrcode;
	let isScanning = $state(false);
	let addingToCart = $state(false);
	let products: any[] | null = $state(null);
	let message: string | null | undefined = $state(null);
	let skuSearch = $state('');

	const shoppingCartState = new LocalStorage<CartItem[]>('cartItems', []);
	onMount(() => {
		html5QrCode = new Html5Qrcode('qr-reader');
	});

	async function startScanning() {
		try {
			scanResult = null;
			skuSearch = '';
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
		skuSearch = decodedText;
		stopScanning();
	}

	function onScanFailure(error: string) {
		console.warn(`QR code scanning failed: ${error}`);
	}

	async function addToCart(product: any) {
		if (product && !addingToCart) {
			addingToCart = true;
			try {
				shoppingCartState.current.push({
					id: product.id,
					name: product.name,
					quantity: 1,
					sku: product.sku
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

	function getPackingInfo(product: any) {
		if (product && product.m_product_packing) {
			return product.m_product_packing
				.map((packing: any) => {
					return `${packing.gtin} (${packing.packing_type}, ${packing.unitsperpack})`;
				})
				.join(', ');
		}
		return 'No packing information available';
	}
</script>

<svelte:head>
	<title>Mobile Barcode Scanner</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<div class="flex-1 overflow-y-auto pb-20">
		<div class="p-4">
			{#if !products || products.length === 0}
				<h1 class="mb-4 text-2xl font-bold">Mobile Barcode Scanner</h1>
				<div id="qr-reader" class="mb-4"></div>
				{#if message}
					<p>{message}</p>
				{/if}
			{:else if products.length === 1}
				{@const product = products[0]}
				<div class="mb-2 flex items-center justify-between">
					<div class="text-2xl font-bold">SKU: {product?.sku ?? 'N/A'}</div>
					<Button onclick={() => addToCart(product)} disabled={addingToCart}>
						{addingToCart ? 'Adding...' : 'Add to Cart'}
					</Button>
				</div>

				<h2 class="mb-2 text-xl font-semibold">
					{product?.name ?? 'Unknown Product'}
				</h2>
			{:else}
				<h1 class="mb-4 text-2xl font-bold">Select Product</h1>
				<ul>
					{#each products as product}
						<li class="mb-2">
							<button onclick={() => addToCart(product)} class="w-full text-left">
								{product.name} - {product.sku}
							</button>
							{#if product.m_product_packing}
								<ul>
									{#each product.m_product_packing as packing}
										<li>
											{packing.gtin} ({packing.packing_type}, {packing.unitsperpack})
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="fixed right-0 bottom-0 left-0 border-t border-gray-200 p-1.5">
		<div class="grid w-full grid-cols-[2fr_1fr_1fr] gap-1.5">
			<form method="POST" action="?/default" use:enhance>
				<Input
					type="search"
					bind:value={skuSearch}
					placeholder="Search by SKU"
					class="w-full"
					name="search_term"
				/>
				<Button type="submit" variant="outline" class="w-full">Search</Button>
			</form>
			{#if !isScanning}
				<Button variant="default" onclick={startScanning}>Scan</Button>
			{:else}
				<Button variant="default" onclick={stopScanning}>Stop</Button>
			{/if}
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
