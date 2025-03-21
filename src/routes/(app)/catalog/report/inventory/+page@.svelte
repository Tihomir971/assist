<script lang="ts">
	import { page } from '$app/state';
	import { DateTime } from 'luxon';

	const { data } = $props();

	let currentDateTime = $state(DateTime.now());
	let warehouseName = $state('Loading...');

	async function fetchWarehouseName(): Promise<void> {
		const warehouseIdStr = page.url.searchParams.get('warehouse');

		if (!warehouseIdStr || typeof warehouseIdStr !== 'string') {
			warehouseName = 'No warehouse specified';
			return;
		}

		const warehouseId = Number(warehouseIdStr);

		if (isNaN(warehouseId) || !Number.isInteger(warehouseId) || warehouseId <= 0) {
			warehouseName = 'Invalid warehouse ID format';
			return;
		}

		const { data: warehouse, error } = await data.supabase
			.from('m_warehouse')
			.select('name')
			.eq('id', warehouseId)
			.single();

		if (error) {
			console.error('Error fetching warehouse:', error);
			warehouseName = 'Unknown Warehouse';
		} else if (warehouse) {
			warehouseName = warehouse.name;
		}
	}

	$effect(() => {
		fetchWarehouseName();
	});

	function printReport() {
		window.print();
	}
</script>

<div class="stock-report">
	<div class="container mx-auto max-w-[820px] bg-white p-2">
		<div class="sticky top-0 z-10 mb-2 flex items-center justify-between bg-white">
			<h1 class="text-xl font-bold text-black">Catalog Stock Report</h1>
			<div>
				<button
					onclick={() => window.close()}
					class="rounded-sm bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600 print:hidden"
				>
					Close
				</button>
				<button
					onclick={printReport}
					class="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600 print:hidden"
				>
					Print Report
				</button>
			</div>
		</div>

		<div class="mb-4 flex justify-between text-sm text-black/80">
			<div>
				<p><strong>Category:</strong> {data.parentCategory?.name}</p>
				<p><strong>Warehouse:</strong> {warehouseName}</p>
			</div>
			<p>
				<strong>Date and Time:</strong>
				{currentDateTime.setLocale('sr-Latn').toLocaleString(DateTime.DATETIME_FULL)}
			</p>
		</div>

		<div class="report-container h-[calc(100vh-8rem)] overflow-y-auto">
			{#each data.categoriesWithProducts as category}
				<div class="mb-4">
					<h2 class="mb-1 text-lg font-semibold text-black/80">{category.name}</h2>
					<div class="overflow-x-auto">
						<table class="w-full border-collapse text-left text-xs text-gray-700">
							<thead class="bg-gray-200 uppercase">
								<tr>
									<th class="border-b px-2 py-1">SKU</th>
									<th class="border-b px-2 py-1">Name</th>
									<th class="border-b px-2 py-1 text-right">ERP</th>
									<th class="border-b px-2 py-1 text-right">Actual</th>
								</tr>
							</thead>
							<tbody>
								{#each category.products as product}
									<tr class="group">
										<td class="px-2 py-0.5 group-first:border-t">{product.sku}</td>
										<td class="px-2 py-0.5 font-medium group-first:border-t">{product.name}</td>
										<td class="px-2 py-0.5 text-right group-first:border-t">{product.stock}</td>
										<td
											class="border-b-2 border-gray-300 px-4 py-0.5 text-right group-first:border-t"
											>&nbsp;</td
										>
									</tr>
									{#if product.barcodes.length > 0}
										<tr class="group border-b">
											<td colspan="4" class="text-2xs px-2 py-0.5">
												<strong>Barcodes:</strong>
												{product.barcodes.join(', ')}
											</td>
										</tr>
									{/if}
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@media print {
		@page {
			margin: 1cm;
			size: portrait;
			@bottom-center {
				content: 'Page ' counter(page) ' of ' counter(pages);
				padding-bottom: 1.5cm;
				font-size: 10pt;
			}
		}

		:global(body) {
			margin: 0;
			padding: 0;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		.stock-report {
			display: block !important;
			width: 100%;
			background: white;
		}

		.container {
			max-width: none !important;
			margin: 0 !important;
			padding: 0 !important;
			background: none !important;
		}

		.report-container {
			height: auto !important;
			overflow: visible !important;
		}

		table {
			border-collapse: collapse;
			width: 100%;
			page-break-inside: auto;
		}

		th {
			background-color: #f0f0f0 !important;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		tr {
			page-break-inside: avoid;
		}

		thead {
			display: table-header-group;
		}
	}

	.text-2xs {
		font-size: 0.65rem;
		line-height: 0.75rem;
	}

	.report-container {
		scrollbar-width: thin;
		scrollbar-color: #888 #f1f1f1;
	}

	.report-container::-webkit-scrollbar {
		width: 8px;
	}

	.report-container::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	.report-container::-webkit-scrollbar-thumb {
		background: #888;
	}

	.report-container::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
