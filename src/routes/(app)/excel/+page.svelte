<script lang="ts">
	import type { Product, Mapping, Supplier } from './types';
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import * as XLSX from 'xlsx';
	//Components
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	// Import utility functions
	import { handleFileUpload, loadSheetData } from './utils/xlsx-handlers';
	import { processExcelData, modifyPrice } from './utils/data-processors';
	import { importProducts, addProduct } from './utils/product-handlers';
	import FormCombobox from '$lib/components/my/FormCombobox.svelte';
	import Combobox from '$lib/components/my/Combobox.svelte';

	let { data } = $props();
	let { supabase } = $derived(data);

	let fileInput: HTMLInputElement | null = $state(null);
	let excelData: Product[] = $state([]);
	let headers: string[] = $state([]);
	let sheetNames: string[] = $state([]);
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

	// const suppliers: Supplier[] = [
	// 	{ id: 480, name: 'Agrofina' },
	// 	{ id: 407, name: 'Gros' },
	// 	{ id: 4, name: 'Mercator-S' },
	// 	{ id: 89, name: 'Mivex' },
	// 	{ id: 5, name: 'Other' }
	// ];
	const productProperties: (keyof Product)[] = [
		'name',
		'vendorproductno',
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

	async function handleFileSelect(event: Event) {
		const result = await handleFileUpload(event);
		sheetNames = result.sheetNames;
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
		if (selectedSheet && fileInput?.files?.[0]) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });
				const result = loadSheetData(workbook, selectedSheet);
				headers = result.headers;
				rawData = result.rawData || [];
				showRawData = true;
				showModal = true;
			};
			reader.readAsArrayBuffer(fileInput.files[0]);
		}
	}

	async function handleMapping() {
		showModal = false;
		if (fileInput?.files?.[0]) {
			saveMappings();
			isProcessing = true;
			const result = await processExcelData(fileInput.files[0], selectedSheet, headers, mappings);
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
			// productsNotUpdated = productsNotUpdated.filter((p) => p.barcode !== product.barcode);
		} catch (error) {
			console.error('Error adding product:', error);
			alert(error instanceof Error ? error.message : 'An error occurred while adding the product.');
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
		selectedSupplier = undefined;
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

	let selectedSupplier: string | undefined = $state(undefined);
	// const triggerSelectedSupplier = $derived(
	// 	data.c_bpartner.find((f) => f.value === selectedSupplier)?.label ?? 'Select Supplier'
	// );
</script>

<div class="mx-auto grid h-full grid-rows-[auto_1fr_auto] gap-4 p-2">
	<h1 class="text-2xl font-bold">Product Data Upload</h1>
	<div class="flex flex-col gap-4">
		<div class="grid grid-cols-3 items-start gap-2">
			<div class="grid w-full gap-1.5">
				<Label for="excel-file">Supplier</Label>
				<Combobox
					options={data.c_bpartner}
					bind:value={selectedSupplier}
					placeholder="Select Supplier"
				/>
			</div>

			<div class="grid w-full gap-1.5">
				<Label for="excel-file">Excel File</Label>
				<Input
					id="excel-file"
					type="file"
					accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
		application/vnd.ms-excel"
					placeholder="Excel files (.xlsx, .xls)"
					onchange={handleFileSelect}
					bind:ref={fileInput}
				/>
			</div>

			{#if sheetNames.length > 1}
				<select class="border p-2" bind:value={selectedSheet} onchange={handleSheetSelect}>
					<option value="">Select a sheet</option>
					{#each sheetNames as sheet}
						<option value={sheet}>{sheet}</option>
					{/each}
				</select>
			{/if}

			<div>
				<div class="grid w-full gap-1.5">
					<Label for="priceModification">Price Modification (%):</Label>
					<Input
						type="number"
						id="priceModification"
						placeholder="email"
						bind:value={priceModificationPercentage}
						min="-100"
						step="0.5"
					/>
					<p class="text-sm text-muted-foreground">
						Enter a percentage to modify prices. Positive values increase prices, negative values
						decrease prices.
					</p>
				</div>
			</div>
		</div>

		{#if showModal}
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
							<Table.Row class="sticky top-0 bg-white">
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
							<Table.Row class="sticky top-0 bg-white">
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
