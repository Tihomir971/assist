<script lang="ts">
	import * as echarts from 'echarts/core';
	import { BarChart, type BarSeriesOption } from 'echarts/charts';
	import {
		DatasetComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		MarkLineComponent,
		type DatasetComponentOption,
		type TooltipComponentOption,
		type GridComponentOption,
		type LegendComponentOption,
		type MarkLineComponentOption
	} from 'echarts/components';
	import { SVGRenderer } from 'echarts/renderers';
	import type { ChartData, YearData } from '$lib/components/charts/chart-types';
	import Echarts from '$lib/components/charts/Echarts.svelte';

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
		const yearMap = new Map<number, Map<number, number>>();

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

		const aggregatedYears: YearData[] = Array.from(yearMap.entries()).map(([year, monthMap]) => ({
			year,
			months: Array.from(monthMap.entries())
				.sort((a, b) => a[0] - b[0])
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

			if (year.year === currentYear) {
				const currentMonth = new Date().getMonth() + 1;
				months = months.filter((m) => m.month < currentMonth);
			}

			if (months.length > 0) {
				const sum = months.reduce((acc, month) => acc + month.value, 0);
				const average = sum / months.length;
				averages.set(year.year, Math.round(average * 100) / 100);
			}
		});

		return averages;
	}

	function getMonthName(month: number): string {
		return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' });
	}

	const chartOptions = $derived.by(() => {
		if (!data?.products || data.products.length === 0) {
			return {
				title: {
					text: 'No data available',
					left: 'center',
					top: 'center'
				}
			};
		}

		const chartYears =
			data.products.length > 1 ? aggregateData(data) : data.products[0]?.years || [];

		const sortedYears = [...chartYears].sort((a, b) => a.year - b.year);
		const yearlyAverages = calculateYearlyAverages(sortedYears, data.currentYear);

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
				top: '15%',
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

		return option;
	});
</script>

<div style="width: 100%; height: 500px;">
	<Echarts init={echarts.init} options={chartOptions} />
</div>
