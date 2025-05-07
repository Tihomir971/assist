<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { DateTime } from 'luxon';
	import { cn } from '$lib/utils.js';
	import PhCalendar from '~icons/ph/calendar';
	import BaseInput from './input-base.svelte';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		value?: Date | string | null;
		locale?: string;
		format?: string; // Date format string
		class?: string;
		error?: string;
		label?: string; // New param for label
		inline?: boolean; // New param for positioning
	};

	let {
		ref = $bindable(null),
		value = $bindable(null),
		locale = 'sr-Latn-RS',
		format = 'dd.MM.yyyy', // Default format for Serbian locale
		class: className = '',
		error,
		label,
		inline,
		...restProps
	}: Props = $props();

	// Generate a unique ID for input-label association if none provided
	const inputId = restProps.id || `input-${Math.random().toString(36).slice(2, 11)}`;

	// Internal state
	let internalDate = $state<DateTime | null>(null);
	let displayValue = $state('');
	let isFocused = $state(false);

	// Parse various date inputs to DateTime
	function parseDate(input: Date | string | null): DateTime | null {
		if (input === null || input === undefined || input === '') return null;

		if (input instanceof Date) {
			return DateTime.fromJSDate(input).setLocale(locale);
		}

		if (typeof input === 'string') {
			// Try parsing with the specified format
			let dt = DateTime.fromFormat(input, format, { locale });

			// If that fails, try some other common formats
			if (!dt.isValid) {
				dt = DateTime.fromISO(input).setLocale(locale);
			}

			if (!dt.isValid) {
				dt = DateTime.fromHTTP(input).setLocale(locale);
			}

			return dt.isValid ? dt : null;
		}

		return null;
	}

	// Format DateTime to string for display
	function formatDate(dt: DateTime | null): string {
		if (!dt || !dt.isValid) return '';
		return dt.toFormat(format);
	}

	// Effect to sync value prop with internal state
	$effect(() => {
		const parsedDate = parseDate(value);

		if (internalDate === null && parsedDate === null) {
			return; // Both null, no change needed
		}

		if (internalDate !== null && parsedDate !== null && internalDate.equals(parsedDate)) {
			return; // Both valid and equal, no change needed
		}

		internalDate = parsedDate;

		// Update display if not focused
		if (!isFocused) {
			displayValue = formatDate(internalDate);
		}
	});

	function handleBlur() {
		isFocused = false;

		// Try to parse the display value
		const inputDate = DateTime.fromFormat(displayValue, format, { locale });

		if (inputDate.isValid) {
			internalDate = inputDate;
			// Update the external value - convert to appropriate type
			if (value instanceof Date) {
				value = inputDate.toJSDate();
			} else {
				value = inputDate.toFormat(format);
			}
		}

		// Re-format display
		displayValue = formatDate(internalDate);
	}

	function handleFocus() {
		isFocused = true;
	}
</script>

{#snippet dateIcon()}
	<PhCalendar class="text-muted-foreground" />
{/snippet}

{#snippet dateContent()}
	<input
		bind:this={ref}
		bind:value={displayValue}
		type="text"
		onblur={handleBlur}
		onfocus={handleFocus}
		placeholder={format.toLowerCase()}
		id={inputId}
		class="peer w-full border-none bg-transparent outline-none"
		{...restProps}
	/>
{/snippet}

{#snippet emptyActions()}
	<!-- No actions for date input, could add a calendar picker in the future -->
{/snippet}

<BaseInput
	bind:ref
	class={className}
	{error}
	{label}
	{inline}
	Icon={dateIcon}
	Content={dateContent}
	Action={emptyActions}
/>
