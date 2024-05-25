import RadixIconsArrowDown from '$lib/icons/RadixIconsArrowDown.svelte';
import RadixIconsArrowRight from '$lib/icons/RadixIconsArrowRight.svelte';
import RadixIconsArrowUp from '$lib/icons/RadixIconsArrowUp.svelte';
import RadixIconsCheckCircled from '$lib/icons/RadixIconsCheckCircled.svelte';
import RadixIconsCircle from '$lib/icons/RadixIconsCircle.svelte';
import RadixIconsCrossCircled from '$lib/icons/RadixIconsCrossCircled.svelte';
import RadixIconsQuestionMarkCircled from '$lib/icons/RadixIconsQuestionMarkCircled.svelte';
import RadixIconsStopwatch from '$lib/icons/RadixIconsStopwatch.svelte';

export const labels = [
	{
		value: 'bug',
		label: 'Bug'
	},
	{
		value: 'feature',
		label: 'Feature'
	},
	{
		value: 'documentation',
		label: 'Documentation'
	}
];

export const statuses = [
	{
		value: 'backlog',
		label: 'Backlog',
		icon: RadixIconsQuestionMarkCircled
	},
	{
		value: 'todo',
		label: 'Todo',
		icon: RadixIconsCircle
	},
	{
		value: 'in progress',
		label: 'In Progress',
		icon: RadixIconsStopwatch
	},
	{
		value: 'done',
		label: 'Done',
		icon: RadixIconsCheckCircled
	},
	{
		value: 'canceled',
		label: 'Canceled',
		icon: RadixIconsCrossCircled
	}
];

export const priorities = [
	{
		label: 'Low',
		value: 'low',
		icon: RadixIconsArrowDown
	},
	{
		label: 'Medium',
		value: 'medium',
		icon: RadixIconsArrowRight
	},
	{
		label: 'High',
		value: 'high',
		icon: RadixIconsArrowUp
	}
];
