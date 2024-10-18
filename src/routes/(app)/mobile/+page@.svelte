<script lang="ts">
	import { onMount } from 'svelte';
	import { Html5QrcodeScanner } from 'html5-qrcode';

	let scanResult: string | null = null;
	let productInfo: any | null = null;

	onMount(() => {
		const html5QrcodeScanner = new Html5QrcodeScanner(
			'qr-reader',
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			/* verbose= */ false
		);

		html5QrcodeScanner.render(onScanSuccess, onScanFailure);
	});

	async function onScanSuccess(decodedText: string) {
		scanResult = decodedText;
		await checkProduct(decodedText);
	}

	function onScanFailure(error: string) {
		// Handle scan failure, if needed
		console.warn(`QR code scanning failed: ${error}`);
	}

	async function checkProduct(barcode: string) {
		try {
			const response = await fetch(`/api/product?gtin=${barcode}`);
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
</script>

<svelte:head>
	<title>Mobile Barcode Scanner</title>
</svelte:head>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Mobile Barcode Scanner</h1>

	<div id="qr-reader" class="mb-4"></div>

	{#if scanResult}
		<p class="mb-2">Scanned barcode: {scanResult}</p>
	{/if}

	{#if productInfo}
		<div class="rounded bg-white p-4 shadow">
			<h2 class="mb-2 text-xl font-semibold">{productInfo.name}</h2>
			<p>GTIN: {productInfo.gtin}</p>
			<!-- Add more product information here as needed -->
		</div>
	{:else if scanResult}
		<p>No product found for this barcode.</p>
	{/if}
</div>
