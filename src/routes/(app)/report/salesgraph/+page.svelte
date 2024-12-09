<script lang="ts">
	import ChartVisualization from '../../catalog/products/[slug]/ChartVisualization.svelte';

	let { data } = $props();
	let chartData = $derived(data.chartData);
</script>

<div class="container mx-auto mt-8">
	<h1>Sales Graph</h1>

	{#if chartData.products?.length === 0}
		<p>No data available. Please select products to view their sales data.</p>
	{:else}
		<div>
			<ChartVisualization data={chartData} />
		</div>
	{/if}
</div>
