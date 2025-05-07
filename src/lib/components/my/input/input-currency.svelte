<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhCurrencyCircleDollar from '~icons/ph/currency-circle-dollar';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';
	import BaseInput from './input-base.svelte';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		locale?: string;
		min?: number;
		max?: number;
		readonly?: boolean;
		class?: string;
		error?: string;
		label?: string; // New param for label
		inline?: boolean; // New param for positioning
		currency?: string; // Currency code (e.g., 'RSD', 'EUR', 'USD')
		currencyDisplay?: 'symbol' | 'code' | 'name'; // How to display the currency
		currencyPosition?: 'prefix' | 'suffix'; // Where to display the currency
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		locale = 'sr-Latn-RS',
		min = 0, // Default min for currency is 0
		max = Number.MAX_SAFE_INTEGER,
		step = 0.01, // Default step for currency is 0.01 (2 decimal places)
		readonly = false,
		class: className,
		error,
		label,
		inline,
		currency = 'RSD', // Default currency for Serbian locale
		currencyDisplay = 'symbol',
		currencyPosition = 'suffix',
		...restProps
	}: Props = $props();

	// Generate a unique ID for input-label association if none provided
	const inputId = restProps.id || `input-${Math.random().toString(36).slice(2, 11)}`;

	// Internal state
	let rawValue = $state<number | null>(null); // Actual number value for data binding
	let displayValue = $state(''); // Formatted string for display
	let isFocused = $state(false);

	// References to input elements
	let hiddenInputRef = $state<HTMLInputElement | null>(null);
	let visibleInputRef = $state<HTMLInputElement | null>(null);

	// Connect external ref to visible input
	$effect(() => {
		ref = visibleInputRef;
	});

	// Extract form-specific attributes for hidden input
	const formProps = {
		name: restProps.name,
		form: restProps.form,
		required: restProps.required
	};

	// Create props for visible input without form properties
	const visibleInputProps = { ...restProps };
	delete visibleInputProps.name;
	delete visibleInputProps.form;
	delete visibleInputProps.required;

	// Get locale-specific format data
	let formatData = $derived(() => {
		// Get decimal and thousand separators using Intl.NumberFormat
		const formatter = new Intl.NumberFormat(locale);
		const parts = formatter.formatToParts(12345.6);

		let decimalSep = '.';
		let thousandSep = ',';
		let currencySymbol = '';

		for (const part of parts) {
			if (part.type === 'decimal') {
				decimalSep = part.value;
			} else if (part.type === 'group') {
				thousandSep = part.value;
			}
		}

		// Get currency symbol
		const currencyFormatter = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			currencyDisplay
		});
		const currencyParts = currencyFormatter.formatToParts(123);
		for (const part of currencyParts) {
			if (part.type === 'currency') {
				currencySymbol = part.value;
			}
		}

		return { decimalSep, thousandSep, currencySymbol };
	});

	// Calculate precision from step
	let precision = $derived.by(() => {
		// Convert step to string and determine decimal places
		const stepStr = String(step);
		const decimalIndex = stepStr.indexOf('.');
		if (decimalIndex === -1) return 0; // No decimal point
		return stepStr.length - decimalIndex - 1;
	});

	// Create a formatter based on the locale and precision
	let formatter = $derived(() => {
		return new Intl.NumberFormat(locale, {
			maximumFractionDigits: precision,
			minimumFractionDigits: precision,
			useGrouping: true
		});
	});

	// Function to parse a locale-specific number string into a number
	function parseLocaleNumber(text: any): number | null {
		// Handle non-string inputs
		if (text === null || text === undefined) return null;

		// Convert to string if it's not already
		let textStr = String(text);

		// Remove currency symbol if present
		const { currencySymbol } = formatData();
		if (currencySymbol) {
			textStr = textStr.replace(currencySymbol, '').trim();
		}

		if (textStr.trim() === '') return null;

		const trimmedText = textStr.trim();

		try {
			// Step 1: Remove thousand separators
			const formatInfo = formatData();
			const decimalSep = formatInfo.decimalSep;
			const thousandSep = formatInfo.thousandSep;
			const escThousandSep = thousandSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			let processedText = trimmedText;

			if (escThousandSep) {
				const thousandRegex = new RegExp(escThousandSep, 'g');
				processedText = processedText.replace(thousandRegex, '');
			}

			// Step 2: Replace decimal separator with standard period
			if (decimalSep !== '.') {
				// Ensure there's only one decimal separator
				const escDecimalSep = decimalSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				const decimalCount = (processedText.match(new RegExp(escDecimalSep, 'g')) || []).length;

				if (decimalCount > 1) {
					console.error(`MyCurrencyInput: Multiple decimal separators in "${processedText}"`);
					return null;
				}

				processedText = processedText.replace(decimalSep, '.');
			}

			// Step 3: Validate and parse
			const validNumberRegex = /^-?\d*\.?\d*$/;

			if (!validNumberRegex.test(processedText)) {
				console.warn(`MyCurrencyInput: Invalid number format: "${processedText}"`);

				// Try a more lenient approach for common cases
				const num = parseFloat(processedText);
				return isNaN(num) ? null : num;
			}

			const num = parseFloat(processedText);
			return isNaN(num) ? null : num;
		} catch (error) {
			console.error(`MyCurrencyInput: Error parsing number:`, error);

			// Fallback approach for common cases
			// If we see a pattern that looks like a number with a comma decimal separator
			if (/^-?\d+,\d+$/.test(trimmedText)) {
				const withDot = trimmedText.replace(',', '.');
				const num = parseFloat(withDot);
				return isNaN(num) ? null : num;
			}

			return null;
		}
	}

	// Function to format a number for display according to locale with currency
	function formatCurrencyNumber(num: number | null): string {
		if (num === null || isNaN(num)) return '';
		try {
			const formattedNumber = formatter().format(num);
			const { currencySymbol } = formatData();

			if (currencyPosition === 'prefix') {
				return `${currencySymbol} ${formattedNumber}`;
			} else {
				return `${formattedNumber} ${currencySymbol}`;
			}
		} catch (e) {
			console.error(`MyCurrencyInput: Error formatting number:`, e);
			return String(num);
		}
	}

	// Update hidden input value
	function updateHiddenInput() {
		if (hiddenInputRef) {
			hiddenInputRef.value = rawValue === null ? '' : String(rawValue);
		}
	}

	// Effect to sync value prop with internal state
	$effect(() => {
		// Handle various value inputs (number, string, null)
		let parsedValue: number | null = null;

		if (value === null || value === undefined || value === '') {
			parsedValue = null;
		} else if (typeof value === 'number') {
			parsedValue = isNaN(value) ? null : value;
		} else {
			// Handle any other type by parsing it
			parsedValue = parseLocaleNumber(value);
		}

		// Ensure parsedValue is a number or null
		if (parsedValue !== null) {
			parsedValue = Number(parsedValue);
		}

		// Only update if different to avoid loops
		if (rawValue !== parsedValue) {
			rawValue = parsedValue;

			// Update display value if not focused
			if (!isFocused) {
				displayValue = formatCurrencyNumber(rawValue);
			}

			// Update hidden input value
			updateHiddenInput();
		}
	});

	// Handle input blur - parse and update value
	function handleBlur() {
		isFocused = false;

		// Parse the display value
		const parsed = parseLocaleNumber(displayValue);

		// Apply min/max constraints
		let constrainedValue = parsed;
		if (parsed !== null) {
			if (parsed < min) constrainedValue = min;
			if (parsed > max) constrainedValue = max;
		}

		// Update internal value
		rawValue = constrainedValue;

		// Update hidden input
		updateHiddenInput();

		// Update external value - ensure it's a number
		value = constrainedValue === null ? null : Number(constrainedValue);

		// Format display value
		displayValue = formatCurrencyNumber(rawValue);
	}

	// Handle form resets
	function handleFormReset() {
		rawValue = null;
		displayValue = '';
		value = null;
		updateHiddenInput();
	}

	function handleFocus() {
		isFocused = true;
	}

	// Increment/decrement value
	function updateValue(increment: boolean) {
		if (readonly) return;

		const currentVal = rawValue ?? 0;
		// Use the actual step value provided, not a derived value
		const validStep = typeof step === 'number' && !isNaN(step) ? step : 0.01;

		let newValue = currentVal + (increment ? validStep : -validStep);

		// Apply constraints
		if (newValue < min) newValue = min;
		if (newValue > max) newValue = max;

		// Round to precision if needed
		if (precision > 0) {
			const factor = Math.pow(10, precision);
			newValue = Math.round(newValue * factor) / factor;
		}

		// Update all values consistently
		rawValue = newValue;
		displayValue = formatCurrencyNumber(newValue);
		value = Number(newValue);
		updateHiddenInput();
	}
	// BaseInput import moved to the top
</script>

{#snippet currencyIcon()}
	<PhCurrencyCircleDollar class="text-muted-foreground" />
{/snippet}

{#snippet currencyContent()}
	<!-- Hidden input for raw value storage and form submission -->
	<input
		bind:this={hiddenInputRef}
		type="hidden"
		value={rawValue === null ? '' : String(rawValue)}
		aria-hidden="true"
		{...formProps}
	/>

	<!-- Visible input for user interaction -->
	<input
		bind:this={visibleInputRef}
		bind:value={displayValue}
		type="text"
		inputmode="decimal"
		onblur={handleBlur}
		onfocus={handleFocus}
		onreset={handleFormReset}
		{readonly}
		id={inputId}
		class="peer w-full [appearance:textfield] border-none bg-transparent outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		aria-label={visibleInputProps['aria-label'] || 'Currency input'}
		{...visibleInputProps}
	/>
{/snippet}

{#snippet currencyActions()}
	{#if !readonly}
		<div class="flex h-full gap-1">
			<button
				type="button"
				onclick={() => updateValue(false)}
				class="flex h-full items-center justify-center hover:text-primary-foreground"
				aria-label="Decrement"
			>
				<PhMinus />
			</button>
			<button
				type="button"
				onclick={() => updateValue(true)}
				class="flex h-full items-center justify-center hover:text-primary-foreground"
				aria-label="Increment"
			>
				<PhPlus />
			</button>
		</div>
	{/if}
{/snippet}

<BaseInput
	bind:ref
	class={className}
	{error}
	{label}
	{inline}
	Icon={currencyIcon}
	Content={currencyContent}
	Action={currencyActions}
/>
