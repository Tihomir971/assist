<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as ExcelJS from 'exceljs';
	import { onDestroy, onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table';
	import type { Product, Mapping, Supplier, ProductToUpdate } from './types';
	import { isValidGTIN } from '$lib/scripts/gtin';
	export let data;
	$: ({ supabase } = data);

	let fileInput: HTMLInputElement | null = null;

	let excelData: Product[] = [];
	let headers: string[] = [];
	let sheetNames: string[] = [];
	let selectedSheet: string = '';
	let showModal = false;
	let mappings: Mapping = {
		name: '',
		vendorproductno: '',
		pricelist: '',
		barcode: '',
		vendorcategory: '',
		manufacturer: ''
	};

	let selectedSupplier: number | null = null;
	const suppliers: Supplier[] = [
		{ id: 480, name: 'Agrofina' },
		{ id: 407, name: 'Gros' },
		{ id: 4, name: 'Mercator-S' },
		{ id: 89, name: 'Mivex' },
		{ id: 5, name: 'Other' }
	];
	const productProperties: (keyof Product)[] = [
		'name',
		'vendorproductno',
		'pricelist',
		'barcode',
		'vendorcategory',
		'manufacturer'
	];

	let totalRows = 0;
	let processedRows = 0;
	let importedRows = 0;
	let isProcessing = false;
	let isImporting = false;

	// New variable for price modification
	let priceModificationPercentage: number = 0;

	// New variables for not updated products
	let productsNotUpdated: Product[] = [];
	let showNotUpdatedProducts = false;

	$: processProgress = totalRows > 0 ? (processedRows / totalRows) * 100 : 0;
	$: importProgress = excelData.length > 0 ? (importedRows / excelData.length) * 100 : 0;

	// Load saved mappings
	onMount(() => {
		if (browser) {
			const savedMappings = localStorage.getItem('supplierMappings');
			if (savedMappings) {
				const parsedMappings = JSON.parse(savedMappings);
				if (selectedSupplier !== null && parsedMappings[selectedSupplier]) {
					mappings = parsedMappings[selectedSupplier];
				}
			}
		}
	});

	// Update mappings when selectedSupplier changes
	$: {
		if (browser && selectedSupplier !== null) {
			const savedMappings = localStorage.getItem('supplierMappings');
			if (savedMappings) {
				const parsedMappings = JSON.parse(savedMappings);
				if (parsedMappings[selectedSupplier]) {
					mappings = parsedMappings[selectedSupplier];
				} else {
					// Reset mappings if there's no saved mapping for this supplier
					mappings = {
						name: '',
						vendorproductno: '',
						pricelist: '',
						barcode: '',
						vendorcategory: '',
						manufacturer: ''
					};
				}
			}
		}
	}

	function saveMappings() {
		if (browser && selectedSupplier !== null) {
			const savedMappings = localStorage.getItem('supplierMappings');
			const parsedMappings = savedMappings ? JSON.parse(savedMappings) : {};
			parsedMappings[selectedSupplier] = mappings;
			localStorage.setItem('supplierMappings', JSON.stringify(parsedMappings));
		}
	}

	async function handleFileUpload(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.load(await file.arrayBuffer());

			sheetNames = workbook.worksheets.map((sheet) => sheet.name);

			if (sheetNames.length === 1) {
				selectedSheet = sheetNames[0];
				await loadSheetData(workbook, selectedSheet);
			} else {
				excelData = [];
				headers = [];
			}
		}
	}

	async function loadSheetData(workbook: ExcelJS.Workbook, sheetName: string) {
		const worksheet = workbook.getWorksheet(sheetName);
		if (!worksheet) return;

		headers = [];
		worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
			const header = cell.value ? cell.value.toString().trim() : `Unknown${colNumber}`;
			headers.push(header);
		});

		showModal = true;
	}

	async function handleSheetSelect() {
		if (selectedSheet && fileInput?.files?.[0]) {
			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.load(await fileInput.files[0].arrayBuffer());
			await loadSheetData(workbook, selectedSheet);
		}
	}

	async function handleMapping() {
		showModal = false;
		if (fileInput?.files?.[0]) {
			saveMappings();
			await processExcelData();
			// Ensure the UI updates
			excelData = [...excelData];
		}
	}

	async function processExcelData() {
		const file = fileInput?.files?.[0];
		if (!file) return;

		isProcessing = true;
		processedRows = 0;

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(await file.arrayBuffer());
		const worksheet = workbook.getWorksheet(selectedSheet);
		if (!worksheet) {
			isProcessing = false;
			return;
		}

		totalRows = worksheet.rowCount - 1; // Exclude header row
		console.log(`Total Rows: ${totalRows}`);
		excelData = [];

		const rowGenerator = processRowsInChunks(worksheet);
		for await (const processedChunk of rowGenerator) {
			excelData.push(...processedChunk);
			processedRows += processedChunk.length;
		}

		isProcessing = false;
	}

	async function* processRowsInChunks(worksheet: ExcelJS.Worksheet, chunkSize: number = 1000) {
		let chunk: Product[] = [];
		let rowNumber = 2; // Start from the second row (skip header)

		while (rowNumber <= worksheet.rowCount) {
			const row = worksheet.getRow(rowNumber);
			if (row.cellCount === 0) break; // End of data

			const product: Partial<Product> = {};
			Object.entries(mappings).forEach(([prop, header]) => {
				const colNumber = headers.indexOf(header) + 1;
				if (colNumber > 0) {
					let value = row.getCell(colNumber).value;
					if (prop === 'pricelist') {
						value = typeof value === 'number' ? value : parseFloat(value as string);
					}
					if (prop === 'vendorproductno') {
						value = typeof value === 'string' ? value : value?.toString();
					}
					if (prop === 'barcode') {
						value = typeof value === 'string' ? value : value?.toString();
					}
					product[prop as keyof Product] = value as any;
				}
			});

			chunk.push(product as Product);

			if (chunk.length >= chunkSize) {
				yield chunk;
				chunk = [];
			}

			rowNumber++;
		}

		if (chunk.length > 0) {
			yield chunk;
		}
	}

	function normalizeVendorProductNo(vendorproductno: string, supplierId?: number | null): string {
		// Remove any non-digit characters
		let normalized = vendorproductno.replace(/\D/g, '');

		if (supplierId === 4) {
			// For supplier 4, ensure the vendorproductno is 9 digits long
			normalized = normalized.padStart(9, '0');
			// If it's longer than 9 digits, take the last 9
			normalized = normalized.slice(-9);
		} else {
			// For other suppliers, just remove leading zeros
			normalized = normalized.replace(/^0+/, '');
		}

		return normalized;
	}

	function modifyPrice(price: number): number {
		return price * (1 + priceModificationPercentage / 100);
	}

	async function importProducts() {
		if (!selectedSupplier) {
			alert('Please select a supplier before importing.');
			return;
		}

		const shouldSetPricesToZero = confirm(
			'Do you want to set all prices to 0 before importing new prices?'
		);

		isImporting = true;
		importedRows = 0;
		let insertedRows = 0;

		try {
			// Fetch existing products for this supplier
			const { data: existingProducts, error: fetchError } = await supabase
				.from('m_product_po')
				.select('id, vendorproductno')
				.eq('c_bpartner_id', selectedSupplier);

			if (fetchError) throw fetchError;

			// Create a map for quick lookup, using normalized vendorproductno
			const productMap = new Map(
				existingProducts.map((p) => [
					normalizeVendorProductNo(p.vendorproductno, selectedSupplier),
					p.id
				])
			);

			if (shouldSetPricesToZero) {
				const { error: updateError } = await supabase
					.from('m_product_po')
					.update({ pricelist: 0 })
					.eq('c_bpartner_id', selectedSupplier);

				if (updateError) throw updateError;
			}

			// Filter Excel data to create two arrays
			const productsToUpdate: ProductToUpdate[] = [];
			productsNotUpdated = [];

			excelData.forEach((product) => {
				const normalizedVendorProductNo = normalizeVendorProductNo(
					product.vendorproductno,
					selectedSupplier
				);
				const existingProductId = productMap.get(normalizedVendorProductNo);
				if (existingProductId !== undefined) {
					productsToUpdate.push({
						...product,
						id: existingProductId,
						normalizedVendorProductNo
					});
				} else if (product.barcode) {
					productsNotUpdated.push(product);
				}
			});

			// Update products in batches
			const batchSize = 100;
			for (let i = 0; i < productsToUpdate.length; i += batchSize) {
				const batch = productsToUpdate.slice(i, i + batchSize);

				for (const product of batch) {
					const { error } = await supabase
						.from('m_product_po')
						.update({
							pricelist: modifyPrice(product.pricelist),
							vendorproductno: product.normalizedVendorProductNo
						})
						.eq('id', product.id)
						.eq('c_bpartner_id', selectedSupplier);

					if (error) {
						console.error('Error updating product:', error);
						continue;
					}

					importedRows++;
				}
			}

			// Check for matching barcodes in m_product table
			const barcodes = productsNotUpdated.map((p) => p.barcode);

			const matchingProducts = [];
			const chunkSize = 10;

			for (let i = 0; i < barcodes.length; i += chunkSize) {
				const barcodeChunk = barcodes.slice(i, i + chunkSize);

				const { data: chunkMatchingProducts, error: barcodeError } = await supabase
					.from('m_product_gtin')
					.select('gtin, m_product_id')
					.in('gtin', barcodeChunk);

				if (barcodeError) {
					throw barcodeError;
				}

				matchingProducts.push(...chunkMatchingProducts);
			}

			const barcodeMatches = new Map(matchingProducts.map((p) => [p.gtin, p.m_product_id]));

			const productsWithMatchingBarcodes = productsNotUpdated.filter((p) =>
				barcodeMatches.has(p.barcode)
			);

			// Insert productsWithMatchingBarcodes into m_product_po
			const insertChunkSize = 100;
			for (let i = 0; i < productsWithMatchingBarcodes.length; i += insertChunkSize) {
				const insertChunk = productsWithMatchingBarcodes.slice(i, i + insertChunkSize);

				const insertData = insertChunk.map((product) => ({
					m_product_id: barcodeMatches.get(product.barcode),
					c_bpartner_id: selectedSupplier,
					vendorproductno: normalizeVendorProductNo(product.vendorproductno, selectedSupplier),
					manufacturer: product.manufacturer,
					vendorcategory: product.vendorcategory,
					pricelist: modifyPrice(product.pricelist)
				}));

				const { data, error } = await supabase.from('m_product_po').insert(insertData).select();

				if (error) {
					console.error('Error inserting products:', error);
					continue;
				}

				insertedRows += data.length;
			}

			// Update productsNotUpdated to only include products that weren't inserted
			productsNotUpdated = productsNotUpdated.filter(
				(product) => !barcodeMatches.has(product.barcode)
			);

			showNotUpdatedProducts = true;

			const selectedSupplierObj = suppliers.find((s) => s.id === selectedSupplier);
			alert(
				`${importedRows} products updated and ${insertedRows} products inserted successfully for supplier: ${selectedSupplierObj?.name} (ID: ${selectedSupplierObj?.id})!`
			);
		} catch (error) {
			console.error('Error importing products:', error);
			alert('An error occurred while updating products. Please check the console for details.');
		} finally {
			isImporting = false;
		}
	}

	function resetAll() {
		if (fileInput && fileInput.value !== undefined) {
			fileInput.value = '';
		}
		excelData = [];
		headers = [];
		sheetNames = [];
		selectedSheet = '';
		showModal = false;
		selectedSupplier = null;
		mappings = {
			name: '',
			vendorproductno: '',
			pricelist: '',
			barcode: '',
			vendorcategory: '',
			manufacturer: ''
		};
		totalRows = 0;
		processedRows = 0;
		importedRows = 0;
		isProcessing = false;
		isImporting = false;
		productsNotUpdated = [];
		showNotUpdatedProducts = false;
	}

	function manualReset() {
		if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
			resetAll();
		}
	}

	onMount(() => {
		fileInput = document.querySelector('input[type="file"]');
	});

	onDestroy(() => {
		resetAll();
	});

	async function addProduct(product: Product) {
		if (!selectedSupplier) {
			alert('Please select a supplier before adding a product.');
			return;
		}

		// Check if the barcode is a valid GTIN
		if (!isValidGTIN(product.barcode)) {
			alert('Invalid GTIN. Please check the barcode.');
			return;
		}

		try {
			// Insert into m_product
			const { data: productData, error: productError } = await supabase
				.from('m_product')
				.insert({ name: product.name })
				.select('id')
				.single();

			if (productError) throw productError;

			const productId = productData.id;

			// Insert into m_product_po
			const { error: poError } = await supabase.from('m_product_po').insert({
				m_product_id: productId,
				c_bpartner_id: selectedSupplier,
				vendorproductno: normalizeVendorProductNo(product.vendorproductno, selectedSupplier),
				pricelist: modifyPrice(product.pricelist)
			});

			if (poError) throw poError;

			// Insert into m_product_gtin
			const { error: gtinError } = await supabase.from('m_product_gtin').insert({
				m_product_id: productId,
				gtin: product.barcode
			});

			if (gtinError) throw gtinError;

			alert('Product added successfully!');
			// Remove the product from the not updated list
			productsNotUpdated = productsNotUpdated.filter((p) => p.barcode !== product.barcode);
		} catch (error) {
			console.error('Error adding product:', error);
			alert('An error occurred while adding the product. Please check the console for details.');
		}
	}
</script>

<div class="container">
	<h1 class="mb-4 text-2xl font-bold">Product Data Upload</h1>

	<div class="mb-4">
		<label class="mb-2 block" for="supplier">Select Supplier:</label>
		<select
			id="supplier"
			class="border bg-surface-document p-2 text-text-1"
			bind:value={selectedSupplier}
		>
			<option value={null}>Select a supplier</option>
			{#each suppliers as supplier}
				<option value={supplier.id}>{supplier.name}</option>
			{/each}
		</select>
	</div>

	<input
		class="mb-4 border p-2"
		type="file"
		accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
               application/vnd.ms-excel"
		placeholder="Excel files (.xlsx, .xls)"
		on:change={handleFileUpload}
		bind:this={fileInput}
	/>

	{#if sheetNames.length > 1}
		<select class="mb-4 border p-2" bind:value={selectedSheet} on:change={handleSheetSelect}>
			<option value="">Select a sheet</option>
			{#each sheetNames as sheet}
				<option value={sheet}>{sheet}</option>
			{/each}
		</select>
	{/if}

	<div class="mb-4">
		<label class="mb-2 block" for="priceModification">Price Modification (%):</label>
		<input
			id="priceModification"
			type="number"
			class="border bg-surface-document p-2 text-text-1"
			bind:value={priceModificationPercentage}
			min="-100"
			step="0.1"
		/>
		<p class="mt-1 text-sm text-gray-500">
			Enter a percentage to modify prices. Positive values increase prices, negative values decrease
			prices.
		</p>
	</div>
	{#if showModal}
		<div class="fixed inset-0 flex items-center justify-center">
			<div class="card">
				<h2 class="mb-4 text-xl font-bold">Map Columns to Product Properties</h2>
				{#each productProperties as prop}
					<div class="mb-2">
						<label class="block" for={prop}>{prop}:</label>
						<select class="w-full border p-1" id={prop} bind:value={mappings[prop]}>
							<option value="">Select a column</option>
							{#each headers as header}
								<option value={header}>{header}</option>
							{/each}
						</select>
					</div>
				{/each}
				<Button on:click={handleMapping}>Apply Mapping</Button>
			</div>
		</div>
	{/if}

	{#if isProcessing}
		<div class="mt-4">
			<p>Processing Excel data: {processedRows} / {totalRows} rows</p>
			<progress value={processProgress} max="100"></progress>
		</div>
	{/if}

	{#if excelData.length > 0 && !showNotUpdatedProducts}
		<div class="h-[600px] overflow-auto">
			<Table.Root class="sticky top-0">
				<Table.Caption>Mapped Product Data from sheet: {selectedSheet}</Table.Caption>
				<Table.Header>
					<Table.Row class="sticky top-0">
						{#each productProperties as prop}
							<Table.Head>{prop}</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each excelData as product}
						<Table.Row>
							{#each productProperties as prop}
								<Table.Cell>{product[prop]}</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		{#if isImporting}
			<div class="mt-4">
				<p>Importing products: {importedRows} / {excelData.length}</p>
				<progress value={importProgress} max="100"></progress>
			</div>
		{:else}
			<Button variant="default" type="button" on:click={importProducts}>Import Products</Button>
		{/if}
	{/if}

	{#if showNotUpdatedProducts && productsNotUpdated.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-xl font-bold">Products Not Updated</h2>
			<div class="h-[600px] overflow-auto">
				<Table.Root class="sticky top-0">
					<Table.Caption>Products Not Updated Caption</Table.Caption>
					<Table.Header>
						<Table.Row class="sticky top-0">
							{#each productProperties as prop}
								<Table.Head>{prop}</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each productsNotUpdated as product}
							<Table.Row>
								{#each productProperties as prop}
									<Table.Cell>{product[prop]}</Table.Cell>
								{/each}
								<Table.Cell>
									<Button on:click={() => addProduct(product)}>+</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	{/if}

	<Button variant="destructive" type="button" on:click={manualReset} class="mt-4">Reset Form</Button
	>
</div>
