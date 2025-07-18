<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { EVENT_NAMES } from '$lib/svelte-echarts/constants/events';
	import type { ChartProps } from '$lib/svelte-echarts/types';

	let {
		init,
		theme = 'light',
		initOptions = {},
		options,
		notMerge = true,
		lazyUpdate = false,
		silent = false,
		replaceMerge,
		transition,
		chart = $bindable(),
		...restProps
	}: ChartProps = $props();

	let element: HTMLDivElement;

	$effect(() => {
		if (chart) {
			chart.setOption(options, { notMerge, lazyUpdate, silent, replaceMerge, transition });
		}
	});

	const initChart = () => {
		if (chart) chart.dispose();

		chart = init(element, theme, initOptions);

		EVENT_NAMES.forEach((eventName) => {
			// @ts-ignore
			chart!.on(eventName, (event) => {
				// @ts-ignore
				restProps['on' + eventName]?.(event);
			});
		});
	};

	onMount(() => {
		initChart();
		const resizeObserver = new ResizeObserver(() => {
			chart?.resize();
		});
		resizeObserver.observe(element);

		return () => {
			resizeObserver.disconnect();
			chart?.dispose();
		};
	});

	const otherProps = $derived(
		Object.keys(restProps)
			.filter((key) => !key.startsWith('on'))
			.reduce(
				(r, k) => ({ ...r, [k]: (restProps as any)[k] }),
				{} as HTMLAttributes<HTMLDivElement>
			)
	);
</script>

<!-- restProps is currently broken with typescript -->
<div
	bind:this={element}
	style="width: 100%; height: 100%; {otherProps.style}"
	{...otherProps}
></div>
