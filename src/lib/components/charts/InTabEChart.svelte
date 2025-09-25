<script lang="ts">
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
	import type { EChartsData } from './chart-types';
	import { onMount } from 'svelte';
	import { Chart } from '../svelte-echarts';

	let chartRef: any | undefined = $state();
	let containerRef: HTMLDivElement | undefined = $state();
	let isVisible = $state(false);

	let { data }: { data: EChartsData } = $props();

	// Register ECharts components
	use([BarChart, GridComponent, CanvasRenderer, TitleComponent, LegendComponent, TooltipComponent]);

	type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;
	const labelOption: BarLabelOption = {
		show: true,
		position: 'insideBottom',
		distance: 15,
		align: 'left',
		verticalAlign: 'middle',
		rotate: 90,
		formatter: '{name|{a}} {c}',
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
				data: data?.series?.map((d) => d.name) ?? []
			},
			xAxis: {
				type: 'category',
				data: data?.xAxis?.data ?? []
			},
			yAxis: {
				type: 'value'
			},
			series:
				data?.series?.map((d) => ({
					name: d.name,
					type: 'bar',
					barGap: 0,
					label: labelOption,
					data: d.data
				})) ?? []
		};
	});

	// Handle chart resize when it becomes available
	$effect(() => {
		if (isVisible && chartRef) {
			// Small delay to ensure Chart component is fully mounted
			setTimeout(() => {
				if (chartRef?.getEchartsInstance) {
					const instance = chartRef.getEchartsInstance();
					if (instance) {
						instance.resize();
					}
				}
			}, 100);
		}
	});

	onMount(() => {
		if (!containerRef) return;

		// Intersection Observer to detect visibility
		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
				});
			},
			{
				threshold: 0.1, // Trigger when 10% visible
				rootMargin: '10px'
			}
		);

		intersectionObserver.observe(containerRef);

		// Cleanup
		return () => {
			intersectionObserver.disconnect();
		};
	});
</script>

<div bind:this={containerRef} class="container mx-auto mt-8">
	{#if !data?.series || data.series.length === 0}
		<p>No data available. Please select products to view their sales data.</p>
	{:else}
		<div class="aspect-video h-full w-full">
			{#if isVisible}
				<Chart {init} {options} bind:this={chartRef} />
			{:else}
				<div class="flex h-full items-center justify-center text-muted-foreground">
					<p>Chart will load when visible...</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
