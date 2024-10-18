<script lang="ts">
	import { onMount } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	type ProductGTIN = {
		gtin: string;
		m_product: {
			name: string;
			description: string;
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
				console.log('productInfo', productInfo);
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

	{#if scanResult}
		<p class="mb-2">Scanned barcode: {scanResult}</p>
	{/if}

	{#if productInfo}
		<div class="rounded p-4 shadow">
			<h2 class="mb-2 text-xl font-semibold">{productInfo.m_product?.name || 'Unknown Product'}</h2>
			<p>GTIN: {productInfo.gtin}</p>
			<p>Description: {productInfo.m_product?.description || 'No description available'}</p>
			<h3 class="mb-2 mt-4 text-lg font-semibold">Storage Information:</h3>
			{#if productInfo.storage_info.length > 0}
				<ul>
					{#each productInfo.storage_info as storage}
						<li>
							Warehouse: {storage.m_warehouse.name}, Quantity on Hand: {storage.qtyonhand}
						</li>
					{/each}
				</ul>
			{:else}
				<p>No storage information available.</p>
			{/if}
		</div>
	{:else if scanResult}
		<p>No product found for this barcode.</p>
	{/if}
</div>
