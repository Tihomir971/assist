<script lang="ts">
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	interface SmartDatePickerProps {
		field: AnalyzedFieldConfig;
		value: string | Date | null | undefined;
		[key: string]: any;
	}

	let { field, value = $bindable(), ...restProps }: SmartDatePickerProps = $props();

	const df = new DateFormatter('en-US', { dateStyle: 'long' });

	// Convert value to DateValue for Calendar
	let dateValue = $state<DateValue | undefined>(undefined);
	let placeholder = $state<DateValue>(today(getLocalTimeZone()));

	// Update dateValue when external value changes
	$effect(() => {
		if (value instanceof Date) {
			const year = value.getFullYear();
			const month = value.getMonth() + 1;
			const day = value.getDate();
			dateValue = new CalendarDate(year, month, day);
		} else if (typeof value === 'string' && value) {
			try {
				dateValue = parseDate(value);
			} catch {
				const date = new Date(value);
				if (!isNaN(date.getTime())) {
					const year = date.getFullYear();
					const month = date.getMonth() + 1;
					const day = date.getDate();
					dateValue = new CalendarDate(year, month, day);
				}
			}
		} else {
			dateValue = undefined;
		}
	});

	function onValueChange(v: DateValue | undefined) {
		if (v) {
			if (value instanceof Date) {
				value = v.toDate(getLocalTimeZone());
			} else {
				value = v.toString();
			}
		} else {
			value = null;
		}
	}
</script>

<Popover.Root>
	<Popover.Trigger
		{...restProps}
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'w-full justify-start pl-4 text-left font-normal',
			!dateValue && 'text-muted-foreground'
		)}
	>
		{dateValue
			? df.format(dateValue.toDate(getLocalTimeZone()))
			: field.placeholder || 'Pick a date'}
		<CalendarIcon class="ml-auto size-4 opacity-50" />
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" side="top">
		<Calendar
			type="single"
			value={dateValue}
			bind:placeholder
			calendarLabel={field.label}
			{onValueChange}
		/>
	</Popover.Content>
</Popover.Root>

<!-- Hidden input for form submission -->
<input hidden value={value || ''} name={restProps.name} />
