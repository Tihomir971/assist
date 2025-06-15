<script lang="ts">
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';
	import { Input } from '$lib/components/ui/input'; // Assuming shadcn-svelte input

	interface SmartInputProps {
		field: AnalyzedFieldConfig; // Configuration for this field
		value: string | number | null | undefined; // Bound value
		[key: string]: any; // Allow additional props from Form.Control
	}

	let {
		field,
		value = $bindable(),
		...restProps // Capture any additional props from Form.Control
	}: SmartInputProps = $props();

	// Determine input type based on field.type or more specific checks if added to FieldConfig
	// For now, if field.type is 'number', use 'number', otherwise 'text'.
	// More specific types like 'email', 'password', 'tel' could be handled if FieldConfig supports them.
	const inputType = field.type === 'number' ? 'number' : 'text';

	// Combine props for the input element
	const inputAttrs = {
		type: inputType,
		...restProps, // Spread Form.Control props first (includes name, id, aria attributes)
		// Then override with field-specific props if needed
		...(field.placeholder && { placeholder: field.placeholder })
		// readonly: field.readonly, // Assuming readonly is part of AnalyzedFieldConfig
		// min: field.validation?.min, // Assuming validation is part of AnalyzedFieldConfig
		// max: field.validation?.max,
		// pattern: field.validation?.pattern,
	};
</script>

<Input {...inputAttrs} bind:value />
