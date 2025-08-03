# ECharts Tab Visibility Solution

## Problem Analysis

The ECharts error "Can't get DOM width or height" occurs because:

1. **Root Cause**: The chart initializes when the tab content is hidden (display: none or visibility: hidden)
2. **Current Issue**: The existing `ResizeObserver` in the Chart component only handles size changes, not visibility changes
3. **Tab Context**: Charts in tabs need to detect when they become visible and reinitialize/resize accordingly

## Solution: Enhanced Chart Component with Visibility Detection

### Approach 1: Modify EBarChart Component (Recommended)

Update `src/lib/components/charts/EBarChart.svelte`:

```svelte
<script lang="ts">
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
	import type { EChartsData } from './chart-types';
	import { onMount } from 'svelte';

	let chartRef: any | undefined = $state();
	let containerRef: HTMLDivElement | undefined = $state();
	let isVisible = $state(false);
	let hasInitialized = $state(false);

	let { data, active = false }: { data: EChartsData; active: boolean } = $props();

	// Register ECharts components
	use([BarChart, GridComponent, CanvasRenderer, TitleComponent, LegendComponent, TooltipComponent]);

	const labelOption = {
		show: true,
		position: 'insideBottom' as const,
		distance: 15,
		align: 'left' as const,
		verticalAlign: 'middle' as const,
		rotate: 90,
		formatter: '{name|{a}} {c}',
		rich: { name: {} }
	};

	// Convert chartData to ECharts options
	const options = $derived.by((): EChartsOption => {
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' }
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
			series: data?.series?.map((d) => ({
				name: d.name,
				type: 'bar',
				barGap: 0,
				label: labelOption,
				data: d.data
			})) ?? []
		};
	});

	// Initialize chart when it becomes visible
	function initializeChart() {
		if (chartRef && isVisible && !hasInitialized) {
			// Small delay to ensure DOM is fully rendered
			setTimeout(() => {
				if (chartRef?.getEchartsInstance) {
					const instance = chartRef.getEchartsInstance();
					if (instance) {
						instance.resize();
						hasInitialized = true;
					}
				}
			}, 100);
		}
	}

	// Handle visibility changes
	$effect(() => {
		if (isVisible && chartRef) {
			initializeChart();
		}
	});

	// Handle data changes - reinitialize if needed
	$effect(() => {
		if (data && isVisible && chartRef) {
			setTimeout(() => {
				if (chartRef?.getEchartsInstance) {
					chartRef.getEchartsInstance().resize();
				}
			}, 50);
		}
	});

	onMount(() => {
		if (!containerRef) return;

		// Intersection Observer to detect visibility
		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const wasVisible = isVisible;
					isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
					
					// If just became visible, trigger initialization
					if (!wasVisible && isVisible) {
						initializeChart();
					}
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
			<Chart {init} {options} bind:this={chartRef} />
		</div>
	{/if}
</div>
```

### Approach 2: Create Tab-Aware Chart Wrapper

Create `src/lib/components/charts/TabAwareChart.svelte`:

```svelte
<script lang="ts">
	import type { Component } from 'svelte';
	import { onMount } from 'svelte';

	interface Props {
		chartComponent: Component;
		chartProps: Record<string, any>;
		tabId?: string;
	}

	let { chartComponent: ChartComponent, chartProps, tabId }: Props = $props();
	
	let containerRef: HTMLDivElement | undefined = $state();
	let isVisible = $state(false);
	let chartInstance: any = $state();

	// Enhanced props with visibility state
	const enhancedProps = $derived({
		...chartProps,
		active: isVisible
	});

	onMount(() => {
		if (!containerRef) return;

		// Intersection Observer for visibility detection
		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
				});
			},
			{
				threshold: 0.1,
				rootMargin: '10px'
			}
		);

		intersectionObserver.observe(containerRef);

		// MutationObserver to detect tab visibility changes
		const mutationObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
					const target = mutation.target as HTMLElement;
					const isActive = target.getAttribute('data-state') === 'active';
					if (isActive && chartInstance) {
						// Tab became active, resize chart
						setTimeout(() => {
							if (chartInstance?.getEchartsInstance) {
								chartInstance.getEchartsInstance().resize();
							}
						}, 100);
					}
				}
			});
		});

		// Observe the tab content for state changes
		const tabContent = containerRef.closest('[data-state]');
		if (tabContent) {
			mutationObserver.observe(tabContent, {
				attributes: true,
				attributeFilter: ['data-state']
			});
		}

		return () => {
			intersectionObserver.disconnect();
			mutationObserver.disconnect();
		};
	});
</script>

<div bind:this={containerRef} class="h-full w-full">
	<ChartComponent {...enhancedProps} bind:this={chartInstance} />
</div>
```

### Approach 3: Update Related Configs (Simplest)

Update `src/routes/(app)/catalog/products/edit/[[id]]/related-configs.ts`:

```typescript
// Replace the sales-chart tab config with:
createTabConfig(
	'sales-chart',
	'Sales Chart',
	EBarChart as Component,
	{
		data: data.salesByWeeks.data,
		active: false // Remove hardcoded true - let component handle visibility
	},
	{ order: 5 }
),
```

## Implementation Steps

### Step 1: Choose Your Approach
- **Approach 1**: Best for comprehensive solution, handles all visibility scenarios
- **Approach 2**: Best for reusability across different chart types
- **Approach 3**: Quickest fix, minimal changes

### Step 2: Update Chart Component
Implement the chosen approach by modifying the appropriate files.

### Step 3: Test Scenarios
Test the following scenarios:
1. Initial page load with chart in non-active tab
2. Switching to chart tab
3. Switching away and back to chart tab
4. Resizing browser window while chart is visible
5. Multiple charts in different tabs

### Step 4: Verify Fix
Ensure the console error is eliminated and charts render properly in all scenarios.

## Additional Considerations

### Performance Optimization
- Use `requestAnimationFrame` for resize operations
- Debounce rapid visibility changes
- Dispose charts properly when tabs are destroyed

### Accessibility
- Ensure charts are announced to screen readers when they become visible
- Add proper ARIA labels for chart containers

### Error Handling
- Add try-catch blocks around chart operations
- Provide fallback content when charts fail to render
- Log meaningful error messages for debugging

## Browser Compatibility
- IntersectionObserver: Supported in all modern browsers
- MutationObserver: Widely supported
- Consider polyfills for older browsers if needed

This solution addresses the root cause of the ECharts DOM sizing issue by ensuring charts only initialize when they're actually visible and have proper dimensions.