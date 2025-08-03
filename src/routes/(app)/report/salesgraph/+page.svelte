<script lang="ts">
	// import ChartVisualization from '$lib/components/charts/ChartVisualization.svelte';

	let { data } = $props();
	let chartData = $derived(data.chartData);

	import { Chart } from 'svelte-echarts';

	import { init, use } from 'echarts/core';
	import { BarChart } from 'echarts/charts';
	import {
		GridComponent,
		TitleComponent,
		LegendComponent,
		TooltipComponent
	} from 'echarts/components';
	import { CanvasRenderer } from 'echarts/renderers';
	import type { EChartsOption } from 'echarts/types/dist/echarts';

	// now with tree-shaking
	use([BarChart, GridComponent, CanvasRenderer, TitleComponent, LegendComponent, TooltipComponent]);

	type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;
	const labelOption: BarLabelOption = {
		show: true,
		position: 'insideBottom', // position: app.config.position as BarLabelOption['position'],
		distance: 15, // distance: app.config.distance as BarLabelOption['distance'],
		align: 'left', // align: app.config.align as BarLabelOption['align'],
		verticalAlign: 'middle', // app.config.verticalAlign as BarLabelOption['verticalAlign'],
		rotate: 90, // app.config.rotate as BarLabelOption['rotate'],
		formatter: '{name|{a}} {c}',
		// fontSize: 16,
		rich: {
			name: {}
		}
	};
	// Convert chartData to ECharts options using runes
	const options = $derived.by((): EChartsOption => {
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			legend: {
				data: chartData?.series?.map((d) => d.name) ?? []
			},
			xAxis: {
				type: 'category',
				data: chartData?.xAxis?.data ?? []
			},
			yAxis: {
				type: 'value'
			},
			series:
				chartData?.series?.map((d) => ({
					name: d.name,
					type: 'bar',
					barGap: 0,
					label: labelOption,
					data: d.data
				})) ?? []
		};
	});
</script>

<div class="container mx-auto mt-8">
	{#if !chartData?.series || chartData.series.length === 0}
		<p>No data available. Please select products to view their sales data.</p>
	{:else}
		<div class="aspect-video h-full w-full">
			<!-- <ChartVisualization data={chartData} /> -->
			<Chart {init} {options} />
		</div>
	{/if}
</div>
