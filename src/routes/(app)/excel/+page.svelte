<script lang="ts">
	import type { Product, Mapping } from './types';
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import * as XLSX from 'xlsx';
	//Components
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	// Import utility functions
	import { handleFileUpload, loadSheetData } from './utils/xlsx-handlers';
	import { processExcelData } from './utils/data-processors';
	import { importProducts, addProduct } from './utils/product-handlers';
	import { ComboboxZag, FileUpload, NumberInputZag, SelectZag } from '$lib/components/zag/index.js';
	import type { FileChangeDetails } from '@zag-js/file-upload';
	import { retrieveAndParseXml, type Product as XmlProductType } from '$lib/xml-parser-esm';

	let { data } = $props();
	let { supabase } = $derived(data);

	// Constants for Spektar XML Import
	const SPEKTAR_SUPPLIER_ID = 347;
	const SPEKTAR_XML_URL =
		'https://api.v2.spektar.rs/storage//exports/xml/kalisi-doo-TMqQOwAxdOBR8VK6PSHtEecygpm1UASz.xml';

	let selectedDataSource: 'excel' | 'spektar' = $state('excel');
	let fileInput: HTMLInputElement | null = $state(null); // Keep for direct DOM manipulation if still needed, but prefer state for file object
	let selectedFile: File | null = $state(null); // New state for the selected file object
	let excelData: Product[] = $state([]);
	let headers: string[] = $state([]);
	let sheetNames: { value: string; label: string }[] = $state([]);
	let selectedSheet: string = $state('');
	let showModal = $state(false);
	let rawData: Array<Record<string, string | number>> = $state([]); // Add state for raw data
	let showRawData = $state(false); // Add state for toggling raw data view
	let mappings: Mapping = $state({
		name: '',
		vendorproductno: '',
		pricelist: '',
		barcode: '',
		vendorcategory: '',
		manufacturer: '',
		valid_from: '',
		valid_to: ''
	});

	const productProperties: (keyof Product)[] = [
		'vendorproductno',
		'name',
		'pricelist',
		'barcode',
		'vendorcategory',
		'manufacturer',
		'valid_from',
		'valid_to'
	];

	let totalRows = $state(0);
	let processedRows = $state(0);
	let importedRows = $state(0);
	let isProcessing = $state(false);
	let isImporting = $state(false);
	let priceModificationPercentage: number = $state(0);
	let productsNotUpdated: Product[] = $state([]);
	let showNotUpdatedProducts = $state(false);

	let processProgress = $derived(totalRows > 0 ? (processedRows / totalRows) * 100 : 0);
	let importProgress = $derived(excelData.length > 0 ? (importedRows / excelData.length) * 100 : 0);

	// Update mappings when selectedSupplier changes
	$effect(() => {
		if (browser && selectedSupplier !== undefined) {
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
						manufacturer: '',
						valid_from: '',
						valid_to: ''
					};
				}
			}
		}
	});

	function saveMappings() {
		if (browser && selectedSupplier !== undefined) {
			const savedMappings = localStorage.getItem('supplierMappings');
			const parsedMappings = savedMappings ? JSON.parse(savedMappings) : {};
			parsedMappings[selectedSupplier] = mappings;
			localStorage.setItem('supplierMappings', JSON.stringify(parsedMappings));
		}
	}
	async function handleFileSelect(details: FileChangeDetails) {
		console.log('details', details);
		selectedFile = details.acceptedFiles.length > 0 ? details.acceptedFiles[0] : null;
		if (!selectedFile) {
			resetAll(); // Or handle no file selected case
			return;
		}
		const result = await handleFileUpload(selectedFile);
		sheetNames = result.sheetNames.map((str) => ({
			value: str,
			label: str
		}));
		selectedSheet = result.selectedSheet;
		excelData = result.excelData;
		headers = result.headers;
		rawData = result.rawData || []; // Store raw data
		showRawData = true; // Show raw data initially

		if (selectedSheet) {
			showModal = true;
		}
	}

	async function handleSheetSelect() {
		console.log('hello inside2', selectedSheet);
		if (selectedSheet && selectedFile) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });
				const result = loadSheetData(workbook, selectedSheet);
				headers = result.headers;
				rawData = result.rawData || [];
				showRawData = true;
				showModal = true; // Keep this to show mapping modal after sheet selection
			};
			reader.readAsArrayBuffer(selectedFile);
		}
	}

	async function handleMapping() {
		showModal = false;
		if (selectedFile) {
			saveMappings();
			isProcessing = true;
			const result = await processExcelData(selectedFile, selectedSheet, headers, mappings);
			totalRows = result.totalRows;
			processedRows = result.processedRows;
			excelData = result.excelData;
			rawData = result.rawData || [];
			isProcessing = false;
			showRawData = false; // Hide raw data after processing
		}
	}

	async function handleImport() {
		if (!selectedSupplier) {
			alert('Please select a supplier before importing.');
			return;
		}

		const shouldSetPricesToZero = confirm(
			'Do you want to set all prices to 0 before importing new prices?'
		);

		if (shouldSetPricesToZero) {
			const { error: updateError } = await supabase
				.from('m_product_po')
				.update({ pricelist: 0 })
				.eq('c_bpartner_id', Number(selectedSupplier));

			if (updateError) {
				alert('Error setting prices to zero. Please try again.');
				return;
			}
		}

		isImporting = true;
		try {
			const result = await importProducts(
				supabase,
				excelData,
				Number(selectedSupplier),
				priceModificationPercentage,
				(rows) => (importedRows = rows)
			);

			productsNotUpdated = result.productsNotUpdated;
			showNotUpdatedProducts = true;

			const selectedSupplierObj = data.c_bpartner.find((s) => s.value === selectedSupplier);
			alert(
				`${result.importedRows} products updated and ${result.insertedRows} products inserted successfully for supplier: ${selectedSupplierObj?.label} (ID: ${selectedSupplierObj?.value})!`
			);
		} catch (error) {
			console.error('Error importing products:', error);
			alert('An error occurred while updating products. Please check the console for details.');
		} finally {
			isImporting = false;
		}
	}

	async function handleAddProduct(product: Product) {
		if (!selectedSupplier) {
			alert('Please select a supplier before adding a product.');
			return;
		}

		try {
			await addProduct(supabase, product, Number(selectedSupplier), priceModificationPercentage);
			alert('Product added successfully!');
		} catch (error) {
			console.error('Error adding product:', error);
			alert(error instanceof Error ? error.message : 'An error occurred while adding the product.');
		}
	}

	async function handleSpektarXmlImport() {
		if (selectedSupplier !== SPEKTAR_SUPPLIER_ID) {
			alert(
				`Spektar XML import is only available for the Spektar supplier (ID: ${SPEKTAR_SUPPLIER_ID}).`
			);
			return;
		}

		isProcessing = true;
		excelData = []; // Clear previous data
		productsNotUpdated = [];
		showNotUpdatedProducts = false;
		totalRows = 0;
		processedRows = 0;
		importedRows = 0;

		try {
			// console.log('Fetching Spektar XML data...');
			const xmlResult = await retrieveAndParseXml(SPEKTAR_XML_URL);
			// console.log('Spektar XML data fetched:', xmlResult);

			if (!xmlResult || !xmlResult.products) {
				throw new Error('No products found in Spektar XML response.');
			}

			const transformedProducts: Product[] = xmlResult.products.map((xmlProd: XmlProductType) => ({
				name: xmlProd.name || '',
				vendorproductno: xmlProd.code || '',
				pricelist: typeof xmlProd.price === 'number' ? xmlProd.price : 0,
				barcode: xmlProd.ean || '',
				vendorcategory: xmlProd.category || '',
				manufacturer: xmlProd.manufacturer || '',
				valid_from: undefined, // Skipped
				valid_to: undefined // Skipped
			}));

			excelData = transformedProducts;
			totalRows = transformedProducts.length;
			processedRows = transformedProducts.length; // Processing is done by transformation
			selectedSheet = 'Spektar XML Data'; // For display consistency
			headers = productProperties; // Use existing productProperties for table headers
			showModal = false; // Ensure mapping modal is hidden

			// console.log('Transformed Spektar products:', excelData);
		} catch (error) {
			console.error('Error during Spektar XML import:', error);
			alert(
				`Failed to import Spektar XML data: ${
					error instanceof Error ? error.message : 'Unknown error'
				}. Check console for details.`
			);
			// Reset relevant states if needed
			excelData = [];
			totalRows = 0;
			processedRows = 0;
		} finally {
			isProcessing = false;
		}
	}

	function resetAll() {
		if (fileInput && fileInput.value !== undefined) {
			// This might still be useful for resetting the visual input element
			fileInput.value = '';
		}
		selectedFile = null; // Reset the selected file state
		excelData = [];
		headers = [];
		sheetNames = [];
		selectedSheet = '';
		showModal = false;
		selectedSupplier = undefined;
		selectedDataSource = 'excel'; // Reset data source
		mappings = {
			name: '',
			vendorproductno: '',
			pricelist: '',
			barcode: '',
			vendorcategory: '',
			manufacturer: '',
			valid_from: '',
			valid_to: ''
		};
		totalRows = 0;
		processedRows = 0;
		importedRows = 0;
		isProcessing = false;
		isImporting = false;
		productsNotUpdated = [];
		showNotUpdatedProducts = false;
		rawData = [];
		showRawData = false;
	}

	function manualReset() {
		if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
			resetAll();
		}
	}

	onMount(() => {
		if (browser) {
			const savedMappings = localStorage.getItem('supplierMappings');
			if (savedMappings) {
				const parsedMappings = JSON.parse(savedMappings);
				if (selectedSupplier !== undefined && parsedMappings[selectedSupplier]) {
					mappings = parsedMappings[selectedSupplier];
				}
			}
		}
		fileInput = document.querySelector('input[type="file"]');
	});

	onDestroy(() => {
		resetAll();
	});

	let selectedSupplier: number | undefined = $state();
	$inspect('selectedSupplier', selectedSupplier == null);
</script>

<div class="mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr_auto] gap-4 p-2">
	<!-- <h1 class="text-2xl font-bold">Product Data Upload</h1> -->
	<div class="flex flex-col gap-4">
		<div class="grid grid-cols-4 items-start gap-2">
			<ComboboxZag
				bind:value={selectedSupplier}
				items={data.c_bpartner}
				label="Supplier"
				placeholder="Select supplier..."
			/>
			<SelectZag
				id="dataSourceSelect"
				bind:value={selectedDataSource}
				items={[
					{ value: 'excel', label: 'Excel Upload' },
					{ value: 'spektar', label: 'Spektar XML Import' }
				]}
				placeholder="Select data source..."
				label="Data Source:"
			/>

			{#if selectedDataSource === 'excel'}
				<div class="flex flex-col gap-2">
					<FileUpload
						accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						onFileChange={handleFileSelect}
						label="Upload Excel File"
						disabled={selectedSupplier == null}
					/>
					{#if sheetNames.length > 1}
						<SelectZag
							bind:value={selectedSheet}
							items={sheetNames}
							label="Select a sheet"
							onValueChange={handleSheetSelect}
						/>
					{/if}
				</div>
			{:else if selectedDataSource === 'spektar'}
				<div class="col-span-2 flex flex-col items-start justify-end">
					<Button
						onclick={handleSpektarXmlImport}
						disabled={selectedSupplier !== SPEKTAR_SUPPLIER_ID || isProcessing || isImporting}
						class="mt-auto"
					>
						Fetch Spektar XML Data
					</Button>
					{#if selectedSupplier !== undefined && selectedSupplier !== SPEKTAR_SUPPLIER_ID}
						<p class="text-sm text-destructive">
							Spektar XML import is only available when "Spektar" (ID: {SPEKTAR_SUPPLIER_ID}) is
							selected as the supplier.
						</p>
					{/if}
				</div>
			{/if}

			<div>
				<div class="grid w-full gap-1.5">
					<NumberInputZag
						bind:value={priceModificationPercentage}
						label="Price Modification (%)"
						min={-100}
						step={0.5}
					/>

					<p class="text-muted-foreground">
						Enter a percentage to modify prices. Positive values increase prices, negative values
						decrease prices.
					</p>
				</div>
			</div>
		</div>

		{#if showModal && selectedDataSource === 'excel'}
			<Card.Root>
				<Card.Header>
					<Card.Title>Map Columns to Product Properties</Card.Title>
					<Card.Description>Map Columns to Product Properties</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-2">
						{#each productProperties as prop}
							<div class="flex items-center justify-between">
								<Label for={prop}>{prop}:</Label>
								<Select.Root type="single" bind:value={mappings[prop]}>
									<Select.Trigger class="w-64" id={prop}
										>{headers.find((f) => f === mappings[prop])}</Select.Trigger
									>
									<Select.Content>
										{#each headers as header}
											<Select.Item value={header}>{header}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						{/each}
					</div>
				</Card.Content>
				<Card.Footer>
					<Button onclick={handleMapping}>Apply Mapping</Button>
				</Card.Footer>
			</Card.Root>
		{/if}

		{#if isProcessing}
			<div>
				<p>Processing Excel data: {processedRows} / {totalRows} rows</p>
				<progress value={processProgress} max="100"></progress>
			</div>
		{/if}

		{#if excelData.length > 0 && !showNotUpdatedProducts}
			<div class="flex flex-col gap-2">
				<div>Mapped Product Data from sheet: {selectedSheet}</div>
				<div
					class="relative flex-1 overflow-auto rounded-md border"
					style="max-height: calc(100vh - 400px);"
				>
					<Table.Root>
						<Table.Header>
							<Table.Row class="sticky top-0">
								{#each productProperties as prop}
									<Table.Head>{prop === 'vendorproductno' ? 'SKU' : prop}</Table.Head>
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
			</div>
			{#if isImporting}
				<div>
					<p>Importing products: {importedRows} / {excelData.length}</p>
					<progress value={importProgress} max="100"></progress>
				</div>
			{:else}
				<Button variant="default" type="button" onclick={handleImport}>Import Products</Button>
			{/if}
		{/if}

		{#if showNotUpdatedProducts && productsNotUpdated.length > 0}
			<div class="flex flex-col gap-2">
				<h2 class="text-xl font-bold">Products Not Updated</h2>
				<div
					class="relative flex-1 overflow-auto rounded-md border"
					style="max-height: calc(100vh - 400px);"
				>
					<Table.Root>
						<Table.Header>
							<Table.Row class="sticky top-0">
								{#each productProperties as prop}
									<Table.Head>{prop === 'vendorproductno' ? 'SKU' : prop}</Table.Head>
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
										<Button onclick={() => handleAddProduct(product)}>+</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		{/if}
	</div>
	<div>
		<Button variant="destructive" type="button" onclick={manualReset}>Reset Form</Button>
	</div>
</div>
