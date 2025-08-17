<script lang="ts">
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer4';
	import { Input } from '$lib/components/ui/input';
	import { DateHelper } from '$lib/scripts/intl/DateHelper';

	interface SmartDatetimeProps {
		field: AnalyzedFieldConfig;
		value: string | null | undefined;
		[key: string]: any; // Allow additional props from Form.Control
	}

	let {
		field,
		value = $bindable(),
		...restProps // Capture any additional props from Form.Control
	}: SmartDatetimeProps = $props();

	// Initialize DateHelper with Serbian locale
	const dateHelper = new DateHelper();

	// Format the datetime for display
	const formattedValue = $derived(dateHelper.format(value));

	// Combine props for the input element
	const inputAttrs = $derived({
		type: 'text',
		readonly: true, // Always readonly for datetime fields (system managed)
		...restProps, // Spread Form.Control props first (includes name, id, aria attributes)
		// Then override with field-specific props if needed
		...(field.placeholder && { placeholder: field.placeholder }),
		...(field.disabled && { disabled: field.disabled }),
		// Override value with formatted datetime
		value: formattedValue || '',
		// Set appropriate placeholder for empty values
		placeholder: field.placeholder || 'No datetime set'
	});
</script>

<!-- Use shadcn Input component for consistency -->
<Input {...inputAttrs} />
