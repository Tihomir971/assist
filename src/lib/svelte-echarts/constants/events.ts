import type { ECharts, ECElementEvent } from 'echarts';

export const EVENT_NAMES = [
	'click',
	'dblclick',
	'mousedown',
	'mousemove',
	'mouseup',
	'mouseover',
	'mouseout',
	'globalout',
	'contextmenu',
	'legendselectchanged',
	'legendselected',
	'legendunselected',
	'legendscroll',
	'datazoom',
	'datarangeselected',
	'timelinechanged',
	'timelineplaychanged',
	'restore',
	'dataviewchanged',
	'magictypechanged',
	'geoselectchanged',
	'geoselected',
	'geounselected',
	'pieselectchanged',
	'pieselected',
	'pieunselected',
	'mapselectchanged',
	'mapselected',
	'mapunselected',
	'axisareaselected',
	'focusnodeadjacency',
	'unfocusnodeadjacency',
	'brush',
	'brushselected',
	'rendered',
	'finished'
] as const;

type EventName = (typeof EVENT_NAMES)[number];

export type EventHandlers = {
	[key in `on${Capitalize<EventName>}`]?: (event: ECElementEvent, chart?: ECharts) => void;
};
