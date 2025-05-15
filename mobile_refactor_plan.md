# Mobile Route Refactor Plan

## Overview

This plan outlines the steps to refactor the code in `src/routes/(app)/mobile/+page@.svelte` and `src/routes/(app)/mobile/+page.server.ts` to use the `search_products` function from Supabase, display a single product if found, or a list of products if multiple are found. The list of barcodes should include the `packing_type` and `unitsperpack`. The SKU search will be integrated into the `search_products` function.

## Steps

1.  **Modify `+page.server.ts`:**
    *   Remove the existing Supabase queries.
    *   Implement the `search_products` RPC function call.
    *   Modify the `search_products` function to search by both barcode and SKU.
    *   Pass the search results to the Svelte component.
2.  **Modify `+page@.svelte`:**
    *   Remove the existing Supabase query.
    *   Update the component to handle the different scenarios:
        *   No products found.
        *   One product found: display the product information.
        *   Multiple products found: display a list of products with barcode, packing type, and units per pack, allowing the user to select one.
    *   Update the display of barcode information to include `packing_type` and `unitsperpack`.
3.  **Refactor code for simplicity and readability.**

## Diffs

**+page.server.ts:**

```diff
--- a/src/routes/(app)/mobile/+page.server.ts
+++ b/src/routes/(app)/mobile/+page.server.ts
@@ -8,22 +8,24 @@
 
 export const actions = {
  default: async ({ request, locals: { supabase } }) => {
-  const form = await superValidate(request, zod(schema));
-  if (!form.valid) return fail(400, { form });
+  		const form = await superValidate(request, zod(schema));
+		if (!form.valid) {
+			return fail(400, { form });
+		}
 
-  const { data, error } = await supabase.rpc('search_products', {
-   search_term: form.data.search_term
-  });
-  if (error) {
-   console.error('Search error:', error);
-   return message(form, { message: 'Search failed' }, { status: 500 });
-  }
+		const searchTerm = form.data.search_term;
 
-  return { form, data, message: 'Search successfully!' };
- }
+		const { data, error } = await supabase.rpc('search_products', {
+			search_term: searchTerm
+		});
+
+		if (error) {
+			console.error('Search error:', error);
+			return message(form, { message: 'Search failed' }, { status: 500 });
+		}
+
+		return { form, products: data, message: 'Search successfully!' };
+	}
 } satisfies Actions;
 
```

**+page@.svelte:**

```diff
--- a/src/routes/(app)/mobile/+page@.svelte
+++ b/src/routes/(app)/mobile/+page@.svelte
@@ -22,7 +22,8 @@
 	};
 
 	let { data } = $props();
-	let { supabase } = $derived(data);
+	let { products, message } = $derived(data);
+	let { supabase } = $derived(data);	
 
 	let scanResult: string | null = $state(null);
 	let productInfo: ProductGTIN | null = $state(null);
@@ -30,7 +31,7 @@
 	let isScanning = $state(false);
 	let skuSearch = $state('');
 	let addingToCart = $state(false);
-
+	
 	const shoppingCartState = new LocalStorage<CartItem[]>('cartItems', []);
 	onMount(() => {
 		html5QrCode = new Html5Qrcode('qr-reader');
@@ -66,117 +67,6 @@
 		console.warn(`QR code scanning failed: ${error}`);
 	}
 
-	async function checkProduct(barcode: string) {
-		const { data, error } = await supabase
-			.from('m_product_packing')
-			.select(
-				'm_product!inner(id,name,description,sku,m_product_packing(gtin,packing_type,unitsperpack),m_storageonhand(qtyonhand,m_warehouse(name)))'
-			)
-			.eq('gtin', barcode)
-			.single();
-
-		if (error) {
-			console.error('Error checking product:', error);
-			alert('Failed to check product. Please try again.');
-			productInfo = null;
-			return;
-		}
-
-		if (data) {
-			productInfo = {
-				gtins: data.m_product.m_product_packing.map((g) => g.gtin ?? ''),
-				m_product: data.m_product
-					? {
-							id: data.m_product.id,
-							name: data.m_product.name,
-							description: data.m_product.description,
-							sku: data.m_product.sku
-						}
-					: null,
-				storage_info: data.m_product.m_storageonhand.map((storage) => ({
-					qtyonhand: storage.qtyonhand ?? 0,
-					m_warehouse: storage.m_warehouse
-						? {
-								name: storage.m_warehouse.name
-							}
-						: null
-				}))
-			};
-			console.log('Product Info:', productInfo);
-		} else {
-			alert('Product not found');
-			productInfo = null;
-		}
-	}
-
-	async function handleSkuSearch() {
-		if (skuSearch) {
-			const { data, error } = await supabase
-				.from('m_product')
-				.select(
-					`
-					id,
-					name,
-					description,
-					sku,
-					m_product_packing (
-						gtin
-					),
-					m_storageonhand (
-						qtyonhand,
-						m_warehouse (
-							name
-						)
-					)
-				`
-				)
-				.eq('sku', skuSearch)
-				.single();
-
-			if (error) {
-				console.error('Error searching product by SKU:', error);
-				alert('Failed to search product. Please try again.');
-				productInfo = null;
-				return;
-			}
-
-			if (data) {
-				productInfo = {
-					gtins: data.m_product_packing.map((g) => g.gtin ?? ''),
-					m_product: data
-						? {
-								id: data.id,
-								name: data.name,
-								description: data.description,
-								sku: data.sku
-							}
-						: null,
-					storage_info: data.m_storageonhand.map((storage) => ({
-						qtyonhand: storage.qtyonhand ?? 0,
-						m_warehouse: storage.m_warehouse
-							? {
-									name: storage.m_warehouse.name
-								}
-							: null
-					}))
-				};
-				console.log('productInfo', productInfo);
-			} else {
-				alert('Product not found');
-				productInfo = null;
-			}
-		}
-	}
-
 	async function addToCart() {
 		if (productInfo && productInfo.m_product && !addingToCart) {
 			addingToCart = true;
@@ -293,11 +93,11 @@
 		}
 	}
 
+
 </script>
 
 <svelte:head>
-	<title>Mobile Barcode Scanner</title>
+	<title>Mobile Product Scanner</title>
 </svelte:head>
 
 <div class="flex min-h-screen flex-col">
@@ -305,51 +105,48 @@
 		<div class="p-4">
 			{#if !productInfo}
 				<h1 class="mb-4 text-2xl font-bold">Mobile Barcode Scanner</h1>
-				<div id="qr-reader" class="mb-4"></div>
-			{/if}
-			{#if scanResult}
-				<p class="mb-2">Scanned barcode: {scanResult}</p>
-			{/if}
-
-			{#if productInfo}
-				<div class="mb-2 flex items-center justify-between">
-					<div class="text-2xl font-bold">SKU: {productInfo.m_product?.sku ?? 'N/A'}</div>
-					<Button onclick={addToCart} disabled={addingToCart}>
-						{addingToCart ? 'Adding...' : 'Add to Cart'}
-					</Button>
-				</div>
-
-				<h2 class="mb-2 text-xl font-semibold">
-					{productInfo.m_product?.name ?? 'Unknown Product'}
-				</h2>
-
-				<h3 class="mb-2 text-lg font-semibold">Storage Information:</h3>
-				{#if productInfo.storage_info.length > 0}
-					<div class="overflow-x-auto">
-						<table class="w-full border-collapse border border-gray-300">
-							<thead>
-								<tr class="bg-gray-500">
-									<th class="border border-gray-300 p-2 text-left">Warehouse</th>
-									<th class="border border-gray-300 p-2 text-left">Quantity on Hand</th>
-								</tr>
-							</thead>
-							<tbody>
-								{#each productInfo.storage_info as storage}
-									{#if storage.qtyonhand > 0 && storage.m_warehouse}
-										<tr>
-											<td class="border border-gray-300 p-2">{storage.m_warehouse.name}</td>
-											<td class="border border-gray-300 p-2">{storage.qtyonhand}</td>
-										</tr>
-									{/if}
-								{/each}
-							</tbody>
-						</table>
-					</div>
-					<h3 class="mb-2 text-lg font-semibold">GTINs:</h3>
-					<ul class="mb-4 list-disc pl-5">
-						{#each productInfo.gtins as gtin}
-							<li>{gtin}</li>
-						{/each}
-					</ul>
-					<p class="mt-4">
-						Description: {productInfo.m_product?.description}
-					</p>
-				{:else}
-					<p>No storage information available.</p>
+				<div id="qr-reader" class="mb-4" />
+				{#if message}
+					<p>{message}</p>
+				{/if}
+			{:else if products.length === 1}
+				{@const product = products[0]}
+					<div class="mb-2 flex items-center justify-between">
+						<div class="text-2xl font-bold">SKU: {product?.sku ?? 'N/A'}</div>
+						<Button onclick={() => addToCart(product)} disabled={addingToCart}>
+							{addingToCart ? 'Adding...' : 'Add to Cart'}
+						</Button>
+					</div>
+
+					<h2 class="mb-2 text-xl font-semibold">
+						{product?.name ?? 'Unknown Product'}
+					</h2>
+			{:else}
+				<h1 class="mb-4 text-2xl font-bold">Select Product</h1>
+				<ul>
+					{#each products as product}
+						<li class="mb-2">
+							<button onclick={() => addToCart(product)} class="w-full text-left">
+								{product.name} - {product.sku}
+							</button>
+							{#if product.m_product_packing}
+								<ul>
+									{#each product.m_product_packing as packing}
+										<li>
+											{packing.gtin} ({packing.packing_type}, {packing.unitsperpack})
+										</li>
+									{/each}
+								</ul>
+							{/if}
+						</li>
+					{/each}
+				</ul>
 			{/if}
 		</div>
 	</div>
@@ -357,13 +154,13 @@
 	<div class="fixed right-0 bottom-0 left-0 border-t border-gray-200 p-1.5">
 		<div class="grid w-full grid-cols-[2fr_1fr_1fr] gap-1.5">
 			<Input type="search" bind:value={skuSearch} placeholder="Search by SKU" class="w-full" />
-			<Button variant="outline" onclick={handleSkuSearch} class="w-full">Search</Button>
+			<Button variant="outline" onclick={() => checkProduct(skuSearch)} class="w-full">Search</Button>
 			{#if !isScanning}
 				<Button variant="default" onclick={startScanning}>Scan</Button>
 			{:else}
 				<Button variant="default" onclick={stopScanning}>Stop</Button>
 			{/if}
-		</div>
+		</div
 	</div>
 </div>