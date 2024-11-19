<script lang="ts">
	import * as echarts from 'echarts/core';
	import { BarChart } from 'echarts/charts';
	import {
		DatasetComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent
	} from 'echarts/components';
	import type { BarSeriesOption } from 'echarts/charts';
	import type {
		DatasetComponentOption,
		TooltipComponentOption,
		GridComponentOption,
		LegendComponentOption
	} from 'echarts/components';
	import { SVGRenderer } from 'echarts/renderers';
	import { onMount } from 'svelte';
	import type { ChartData } from '$lib/types/connector';
	echarts.use([
		DatasetComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		BarChart,
		SVGRenderer
	]);
	type EChartsOption = echarts.ComposeOption<
		| DatasetComponentOption
		| TooltipComponentOption
		| GridComponentOption
		| LegendComponentOption
		| BarSeriesOption
	>;
	type Props = { data: ChartData };
	let { data }: Props = $props();

	// Register components

	let chartInstance: echarts.ECharts | null = null;
	let chartContainer: HTMLDivElement;

	function getMonthName(month: number): string {
		return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' });
	}

	function initializeChart() {
		if (!chartContainer || !data?.years) return;

		console.log('Initializing chart with container dimensions:', {
			width: chartContainer.clientWidth,
			height: chartContainer.clientHeight
		});

		chartInstance = echarts.init(chartContainer);

		// Sort years in ascending order
		const sortedYears = [...data.years].sort((a, b) => a.year - b.year);

		// Prepare series data for each year
		const series: Array<BarSeriesOption> = sortedYears.map((year) => ({
			type: 'bar',
			name: year.year.toString(),
			data: year.months.map((month) => month.value)
		}));

		const option: EChartsOption = {
			darkMode: 'auto',
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			legend: {
				data: sortedYears.map((year) => year.year.toString()),
				bottom: 0,
				textStyle: { color: 'var(--text-2)' }
			},
			grid: {},
			xAxis: {
				data: Array.from({ length: 12 }, (_, i) => getMonthName(i + 1)),
				axisLabel: {
					rotate: 30
				}
			},
			yAxis: {
				type: 'value',
				name: 'Pieces'
			},
			series
		};

		chartInstance.setOption(option);
		console.log('Chart options set:', option);
	}

	// Initialize chart when data changes
	$effect(() => {
		console.log('Effect running, data changed:', !!data);
		if (chartInstance) {
			initializeChart();
		}
	});

	onMount(() => {
		console.log('Component mounted');
		initializeChart();

		// Handle window resize
		const resizeHandler = () => {
			console.log('Window resized');
			if (chartInstance) {
				chartInstance.resize();
			}
		};
		window.addEventListener('resize', resizeHandler);

		// Cleanup on destroy
		return () => {
			window.removeEventListener('resize', resizeHandler);
			if (chartInstance) {
				chartInstance.dispose();
			}
		};
	});
</script>

<div bind:this={chartContainer} style="width: 100%; height: 500px;"></div>
