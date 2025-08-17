<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { Chart } from 'svelte-echarts';
	import { init, use } from 'echarts/core';
	import { BarChart } from 'echarts/charts';
	import { GridComponent, TitleComponent } from 'echarts/components';
	import { CanvasRenderer } from 'echarts/renderers';
	import type { EChartsOption } from 'echarts';
	import { CheckboxArk } from '$lib/components/ark';

	// now with tree-shaking
	use([BarChart, GridComponent, CanvasRenderer, TitleComponent]);

	let options: EChartsOption = {
		xAxis: {
			type: 'category',
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				data: [120, 200, 150, 80, 70, 110, 130],
				type: 'bar'
			}
		]
	};
	let checked: 'indeterminate' | boolean = $state('indeterminate');
	$inspect('checked', checked);
</script>

<div class="app">
	<!-- 	<div class="flex h-full content-center gap-4 p-8 *:size-28 *:place-content-center *:text-center">
		<div class="bg-primary">Primary</div>
		<div class="bg-secondary">Secondary</div>
		<div class="bg-error">Error</div>
		<div class="bg-warning">Warning</div>
		<div class="bg-info">Info</div>
		<div class="bg-success">Success</div>
	</div> -->
	<!-- <Chart {init} {options} /> -->
	<div class="m-8 bg-[#191918] p-8">
		<CheckboxArk bind:checked label="Label" invalid />
	</div>
</div>

<style>
	.app {
		width: 100vw;
		height: 100vh;
	}
</style>
