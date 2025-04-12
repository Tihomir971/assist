<script lang="ts">
	import * as echarts from 'echarts/core';
	import { BarChart } from 'echarts/charts';
	import {
		DatasetComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		MarkLineComponent
	} from 'echarts/components';
	import type { BarSeriesOption } from 'echarts/charts';
	import type {
		DatasetComponentOption,
		TooltipComponentOption,
		GridComponentOption,
		LegendComponentOption,
		MarkLineComponentOption
	} from 'echarts/components';
	import { SVGRenderer } from 'echarts/renderers';
	import { onMount } from 'svelte';
	import type { ChartData, YearData } from './chart-types';

	echarts.use([
		DatasetComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		MarkLineComponent,
		BarChart,
		SVGRenderer
	]);

	type EChartsOption = echarts.ComposeOption<
		| DatasetComponentOption
		| TooltipComponentOption
		| GridComponentOption
		| LegendComponentOption
		| MarkLineComponentOption
		| BarSeriesOption
	>;

	type Props = { data: ChartData };
	let { data }: Props = $props();

	function aggregateData(data: ChartData): YearData[] {
		// Create a map to store aggregated values by year and month
		const yearMap = new Map<number, Map<number, number>>();

		// Aggregate values from all products
		data.products.forEach((product) => {
			product.years.forEach((year) => {
				if (!yearMap.has(year.year)) {
					yearMap.set(year.year, new Map());
				}
				const monthMap = yearMap.get(year.year)!;

				year.months.forEach((month) => {
					const currentValue = monthMap.get(month.month) || 0;
					monthMap.set(month.month, currentValue + month.value);
				});
			});
		});

		// Convert the map back to the YearData structure
		const aggregatedYears: YearData[] = Array.from(yearMap.entries()).map(([year, monthMap]) => ({
			year,
			months: Array.from(monthMap.entries())
				.sort((a, b) => a[0] - b[0]) // Sort by month
				.map(([month, value]) => ({
					month,
					value
				}))
		}));

		return aggregatedYears.sort((a, b) => a.year - b.year);
	}

	function calculateYearlyAverages(years: YearData[], currentYear: number): Map<number, number> {
		const averages = new Map<number, number>();

		years.forEach((year) => {
			let months = year.months;

			// For current year, only include completed months
			if (year.year === currentYear) {
				const currentMonth = new Date().getMonth() + 1; // 1-based month
				months = months.filter((m) => m.month < currentMonth);
			}

			if (months.length > 0) {
				const sum = months.reduce((acc, month) => acc + month.value, 0);
				const average = sum / months.length;
				averages.set(year.year, Math.round(average * 100) / 100); // Round to 2 decimal places
			}
		});

		return averages;
	}

	function getMonthName(month: number): string {
		return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' });
	}

	function initializeChart() {
		if (!chartContainer || !data?.products) return;

		chartInstance = echarts.init(chartContainer);

		// Aggregate data if there are multiple products
		const chartYears =
			data.products.length > 1 ? aggregateData(data) : data.products[0]?.years || [];

		// Sort years in ascending order
		const sortedYears = [...chartYears].sort((a, b) => a.year - b.year);

		// Calculate yearly averages
		const yearlyAverages = calculateYearlyAverages(sortedYears, data.currentYear);

		// Prepare series data for each year
		const series: BarSeriesOption[] = sortedYears.map((year) => ({
			type: 'bar',
			name: year.year.toString(),
			data: year.months.map((month) => month.value),
			markLine: yearlyAverages.get(year.year)
				? {
						symbol: ['none', 'none'],
						label: {
							formatter: `Avg ${year.year}: {c}`,
							position: 'end',
							distance: [0, 10],
							padding: [4, 8],
							borderRadius: 4,
							color: 'var(--color-muted-foreground)'
						},
						lineStyle: {
							type: 'solid',
							width: 2
						},
						data: [
							{
								name: `Average ${year.year}`,
								yAxis: yearlyAverages.get(year.year)
							}
						]
					}
				: undefined
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
				textStyle: { color: 'var(--color-muted-foreground)' }
			},
			grid: {
				top: '15%', // Increased to accommodate labels
				bottom: '15%',
				containLabel: true
			},
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
	}

	// Re-initialize chart options when data changes, only if chart exists
	$effect(() => {
		if (chartInstance && data?.products) {
			console.log('Data changed, re-initializing chart options');
			initializeChart(); // Re-calculates options based on new data and applies them
		}
	});

	let chartInstance: echarts.ECharts | null = null;
	let chartContainer: HTMLDivElement;

	let chartWidth = $state(0);
	let chartHeight = $state(0);

	// Effect for handling initialization and resize based on container dimensions
	$effect(() => {
		const width = chartWidth;
		const height = chartHeight;

		if (width > 0 && height > 0) {
			if (!chartInstance && chartContainer) {
				// Initialize chart only when container has dimensions and chart is not already initialized
				console.log(`Container dimensions available: ${width}x${height}, initializing chart...`);
				initializeChart();
			} else if (chartInstance) {
				// Resize existing chart instance
				console.log(`Chart container resized: ${width}x${height}, resizing chart...`);
				chartInstance.resize();
			}
		} else if (chartInstance) {
			// Optional: Log when dimensions become zero (e.g., tab hidden)
			// console.log(`Chart container dimensions became zero.`);
		}
	});

	onMount(() => {
		// Chart initialization is now handled by the $effect watching dimensions
		// Cleanup on destroy
		return () => {
			if (chartInstance) {
				chartInstance.dispose();
				chartInstance = null;
			}
		};
	});
</script>

<div
	bind:this={chartContainer}
	bind:clientWidth={chartWidth}
	bind:clientHeight={chartHeight}
	style="width: 100%; height: 500px;"
></div>

<!-- Debug output -->
<!-- <p>Container Size: {chartWidth} x {chartHeight}</p> -->
