<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import type { ChartData, ProcessedMonthData } from '$lib/types/connector';

	type Props = { data: ChartData };
	let { data }: Props = $props();

	// Colors for different years
	const yearColors = ['#fcd34d', '#60a5fa', '#4ade80'];

	// 1. Process data to group by month
	let processedData = $derived<ProcessedMonthData[]>(
		Array.from({ length: 12 }, (_, i) => {
			const monthNumber = i + 1;
			const yearValues = data.years.map((year) => ({
				year: year.year,
				value: year.months.find((m) => m.month === monthNumber)?.value ?? 0,
				isCurrentYear: year.year === data.currentYear
			}));
			return {
				month: monthNumber,
				yearValues
			};
		})
	);

	// 2. Dimensions, Margins & Scales
	const padding = { top: 20, right: 15, bottom: 60, left: 25 }; // Increased bottom padding for legend
	let width = $state(500);
	let height = 350;

	const chartHeight = $derived(height - padding.bottom); // Actual chart height excluding legend area

	// Calculate max value for y-axis
	const maxValue = $derived(
		Math.max(...processedData.flatMap((month) => month.yearValues.map((y) => y.value)))
	);
	const maxTickValue = $derived(Math.ceil(maxValue / 5) * 5);
	const yTicks = $derived(Array.from({ length: maxTickValue / 5 + 1 }, (_, i) => i * 5));

	let innerWidth = $derived(width - (padding.left + padding.right));
	let monthWidth = $derived(innerWidth / 12); // 12 months
	let barWidth = $derived((monthWidth * 0.8) / data.years.length); // Divide month space by number of years

	let xScale = $derived(
		scaleLinear()
			.domain([0, 12])
			.range([padding.left, width - padding.right])
	);

	let yScale = $derived(
		scaleLinear()
			.domain([0, Math.max.apply(null, yTicks)])
			.range([chartHeight, padding.top])
	);

	// 3. Helper functions
	function formatMonth(month: number) {
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		return monthNames[month - 1];
	}

	function formatMobile(month: number) {
		return formatMonth(month).slice(0, 1);
	}

	function getBarX(monthIndex: number, yearIndex: number) {
		const monthX = xScale(monthIndex);
		const yearOffset = yearIndex * barWidth;
		const groupOffset = (monthWidth - barWidth * data.years.length) / 2;
		return monthX + groupOffset + yearOffset;
	}
</script>

<div class="chart" bind:clientWidth={width}>
	<svg {width} {height}>
		<!-- 4. Design the bars -->
		<g class="bars">
			{#each processedData as monthData, monthIndex}
				{#each monthData.yearValues as yearData, yearIndex}
					<g>
						<rect
							x={getBarX(monthIndex, yearIndex)}
							y={yScale(yearData.value)}
							width={barWidth * 0.9}
							height={yScale(0) - yScale(yearData.value)}
							fill={yearColors[yearIndex]}
							class:current={yearData.isCurrentYear}
						>
							<title>{yearData.year} {formatMonth(monthData.month)}: {yearData.value}</title>
						</rect>
					</g>
				{/each}
			{/each}
		</g>

		<!-- Design y axis -->
		<g class="axis y-axis">
			{#each yTicks as tick}
				<g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
					<line x2="100%" />
					<text y="-4">{tick}</text>
				</g>
			{/each}
		</g>

		<!-- Design x axis -->
		<g class="axis x-axis">
			{#each processedData as monthData, i}
				<g class="tick" transform="translate({xScale(i)}, {chartHeight})">
					<text x={monthWidth / 2} y="20">
						{width > 380 ? formatMonth(monthData.month) : formatMobile(monthData.month)}
					</text>
				</g>
			{/each}
		</g>

		<!-- Legend -->
		<g class="legend" transform="translate({padding.left}, {height - 15})">
			{#each data.years as year, i}
				<g transform="translate({i * 100}, 0)" class="legend-item">
					<rect
						x="0"
						y="0"
						width="15"
						height="15"
						fill={yearColors[i]}
						class:current={year.year === data.currentYear}
					/>
					<text x="25" y="12">{year.year}</text>
				</g>
			{/each}
		</g>
	</svg>
</div>

<style>
	.x-axis .tick text {
		text-anchor: middle;
		color: white;
	}

	.bars rect {
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.bars rect:hover {
		opacity: 1;
	}

	.bars rect.current {
		opacity: 1;
	}

	.tick {
		font-family: Poppins, sans-serif;
		font-size: 0.725em;
		font-weight: 200;
		color: white;
	}

	.tick text {
		fill: white;
		text-anchor: start;
		color: white;
	}

	.tick line {
		stroke: #fcd34d;
		stroke-dasharray: 2;
		opacity: 0.5;
	}

	.tick.tick-0 line {
		display: inline-block;
		stroke-dasharray: 0;
	}

	.legend text {
		fill: white;
		font-size: 0.825em;
		font-weight: 500;
	}

	.legend-item {
		cursor: pointer;
	}

	.legend rect {
		opacity: 0.7;
	}

	.legend rect.current {
		opacity: 1;
	}
</style>
