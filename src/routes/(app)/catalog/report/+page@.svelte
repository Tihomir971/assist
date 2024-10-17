<script lang="ts">
	import { page } from '$app/stores';

	const { data } = $props();

	let currentDateTime = $state('');
	let warehouseName = $state('Loading...');

	async function fetchWarehouseName() {
		const warehouseId = $page.url.searchParams.get('warehouse');
		if (warehouseId) {
			const { data: warehouse, error } = await data.supabase
				.from('m_warehouse')
				.select('name')
				.eq('id', warehouseId)
				.single();

			if (error) {
				console.error('Error fetching warehouse:', error);
				warehouseName = 'Unknown Warehouse';
			} else {
				warehouseName = warehouse.name;
			}
		} else {
			warehouseName = 'No Warehouse Selected';
		}
	}

	function updateDateTime() {
		const now = new Date();
		currentDateTime = now.toLocaleString();
	}

	$effect(() => {
		updateDateTime();
		const interval = setInterval(updateDateTime, 60000);
		fetchWarehouseName();
		return () => clearInterval(interval);
	});

	function printReport() {
		window.print();
	}
</script>

<div class="container mx-auto max-w-[820px] bg-white p-2">
	<div
		class="sticky top-0 z-10 mb-2 flex items-center justify-between bg-white print:static print:bg-transparent"
	>
		<h1 class="text-xl font-bold text-black">Catalog Stock Report</h1>
		<button
			onclick={printReport}
			class="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600 print:hidden"
		>
			Print Report
		</button>
	</div>

	<div class="mb-4 text-sm text-black/80">
		<p><strong>Date and Time:</strong> {currentDateTime}</p>
		<p><strong>Warehouse:</strong> {warehouseName}</p>
	</div>

	<div
		class="report-container h-[calc(100vh-8rem)] overflow-y-auto print:h-auto print:overflow-visible"
	>
		{#each data.categoriesWithProducts as category}
			<div class="mb-4">
				<h2 class="mb-1 text-lg font-semibold text-black/80">{category.name}</h2>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-left text-xs text-gray-700">
						<thead class="bg-gray-200 uppercase">
							<tr>
								<th class="border-b px-2 py-1">SKU</th>
								<th class="border-b px-2 py-1">Name</th>
								<th class="border-b px-2 py-1">Stock</th>
							</tr>
						</thead>
						<tbody>
							{#each category.products as product}
								<tr class="group">
									<td class="px-2 py-1 group-first:border-t">{product.sku}</td>
									<td class="px-2 py-1 font-medium group-first:border-t">{product.name}</td>
									<td class="px-2 py-1 group-first:border-t">{product.stock}</td>
								</tr>
								{#if product.barcodes.length > 0}
									<tr class="group">
										<td colspan="3" class="text-2xs px-2 py-0.5 italic">
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

<style>
	@media print {
		.container {
			max-width: 800px;
			margin: 0 auto;
			padding: 0;
		}
		table,
		th,
		td {
			border-color: #000 !important;
		}
		th {
			background-color: #f0f0f0 !important;
		}
	}
	.text-2xs {
		font-size: 0.65rem;
		line-height: 0.75rem;
	}
	/* Add border only to the top of the first row in each group */
	.group:not(:first-child) .group-first\:border-t {
		border-top-width: 1px;
	}
	/* Custom scrollbar styles */
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
