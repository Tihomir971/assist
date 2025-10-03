<script lang="ts">
	import { NumberInputDecimal } from '$lib/components/ark';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';

	interface SmartNumberInputProps {
		field: AnalyzedFieldConfig & { step?: number; fraction?: number };
		value: number | null | undefined;
		[key: string]: any;
	}

	let { field, value = $bindable(), ...restProps }: SmartNumberInputProps = $props();

	const inputAttrs = {
		...restProps,
		...(field.placeholder && { placeholder: field.placeholder }),
		...(field.readonly && { readonly: field.readonly }),
		...(field.disabled && { disabled: field.disabled }),
		...(field.validation?.min !== undefined && { min: field.validation.min }),
		...(field.validation?.max !== undefined && { max: field.validation.max })
	};
</script>

<NumberInputDecimal
	{...inputAttrs}
	bind:value
	step={field.step}
	formatOptions={{
		minimumFractionDigits: field.fraction,
		maximumFractionDigits: field.fraction
	}}
/>
