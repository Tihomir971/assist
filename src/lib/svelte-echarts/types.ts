import type {
	EChartsCoreOption as EChartsOption,
	EChartsType,
	init,
	SetOptionOpts
} from 'echarts/core';
import type { EChartsInitOpts } from 'echarts/types/dist/shared';
import type { HTMLAttributes } from 'svelte/elements';
import type { EventHandlers } from './constants/events';

export type ChartProps = {
	init: typeof init;
	theme?: string | object;
	initOptions?: EChartsInitOpts;
	options: EChartsOption;
	chart?: EChartsType;
} & SetOptionOpts &
	EventHandlers &
	HTMLAttributes<HTMLDivElement>;
