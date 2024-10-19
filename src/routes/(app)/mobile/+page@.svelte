<script lang="ts">
	import { onMount } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	type ProductGTIN = {
		gtins: string[]; // Changed from single gtin to array of gtins
		m_product: {
			name: string;
			description: string;
			sku: string;
		} | null;
		storage_info: {
			qtyonhand: number;
			m_warehouse: {
				name: string;
			};
		}[];
	};
	let scanResult: string | null = null;
	let productInfo: ProductGTIN | null = null;
	let html5QrCode: Html5Qrcode;
	let isScanning = false;
	let manualGtin: string = '';
	let skuSearch: string = '';

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
		// Handle scan failure, if needed
		console.warn(`QR code scanning failed: ${error}`);
	}

	async function checkProduct(barcode: string) {
		try {
			const response = await fetch(`/api/product?gtin=${barcode}`, { method: 'GET' });

			if (response.ok) {
				productInfo = await response.json();
			} else {
				productInfo = null;
				alert('Product not found');
			}
		} catch (error) {
			console.error('Error checking product:', error);
			alert('Failed to check product. Please try again.');
		}
	}

	function handleManualSubmit() {
		if (manualGtin) {
			checkProduct(manualGtin);
		}
	}

	async function handleSkuSearch() {
		if (skuSearch) {
			try {
				const response = await fetch(`/api/product?sku=${skuSearch}`, { method: 'GET' });
				console.log('response', response);

				if (response.ok) {
					productInfo = await response.json();
					console.log('productInfo', productInfo);
				} else {
					productInfo = null;
					alert('Product not found');
				}
			} catch (error) {
				console.error('Error searching product by SKU:', error);
				alert('Failed to search product. Please try again.');
			}
		}
	}
</script>

<svelte:head>
	<title>Mobile Barcode Scanner</title>
</svelte:head>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Mobile Barcode Scanner</h1>

	<div id="qr-reader" class="mb-4"></div>

	{#if !isScanning}
		<button on:click={startScanning} class="mb-4 rounded bg-blue-500 px-4 py-2 text-white">
			Start Scanning
		</button>
	{:else}
		<button on:click={stopScanning} class="mb-4 rounded bg-red-500 px-4 py-2 text-white">
			Stop Scanning
		</button>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={manualGtin}
			placeholder="Enter GTIN manually"
			class="mr-2 rounded border p-2"
		/>
		<button on:click={handleManualSubmit} class="rounded bg-green-500 px-4 py-2 text-white">
			Check Product
		</button>
	</div>

	<div class="mb-4">
		<input
			type="text"
			bind:value={skuSearch}
			placeholder="Search by SKU"
			class="mr-2 rounded border p-2"
		/>
		<button on:click={handleSkuSearch} class="rounded bg-purple-500 px-4 py-2 text-white">
			Search SKU
		</button>
	</div>

	{#if scanResult}
		<p class="mb-2">Scanned barcode: {scanResult}</p>
	{/if}

	{#if productInfo}
		<div class="rounded p-4 shadow">
			<h2 class="mb-2 text-xl font-semibold">{productInfo.m_product?.name || 'Unknown Product'}</h2>
			<h3 class="mb-2 text-lg font-semibold">GTINs:</h3>
			<ul class="mb-4 list-disc pl-5">
				{#each productInfo.gtins as gtin}
					<li>{gtin}</li>
				{/each}
			</ul>
			<p>SKU: {productInfo.m_product?.sku || 'N/A'}</p>

			<h3 class="mb-2 mt-4 text-lg font-semibold">Storage Information:</h3>
			{#if productInfo.storage_info.length > 0}
				<table class="w-full border-collapse border border-gray-300">
					<thead>
						<tr class="bg-gray-500">
							<th class="border border-gray-300 p-2 text-left">Warehouse</th>
							<th class="border border-gray-300 p-2 text-left">Quantity on Hand</th>
						</tr>
					</thead>
					<tbody>
						{#each productInfo.storage_info as storage}
							<tr>
								<td class="border border-gray-300 p-2">{storage.m_warehouse.name}</td>
								<td class="border border-gray-300 p-2">{storage.qtyonhand}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<p>Description: {productInfo.m_product?.description || 'No description available'}</p>
			{:else}
				<p>No storage information available.</p>
			{/if}
		</div>
	{:else if scanResult}
		<p>No product found for this barcode.</p>
	{/if}
</div>
