<script lang="ts">
	import { NumberInputDecimal } from '$lib/components/ark';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';

	interface SmartNumberInputProps {
		field: AnalyzedFieldConfig & { step?: number; fraction?: number };
		value: number | null | undefined;
		[key: string]: any;
	}

	let { field, value = $bindable(), ...restProps }: SmartNumberInputProps = $props();
	import { appSettings } from '$lib/context';
	const inputAttrs: Record<string, any> = {
		...restProps,
		...(field.placeholder && { placeholder: field.placeholder }),
		...(field.readonly && { readonly: field.readonly }),
		...(field.disabled && { disabled: field.disabled })
	};

	// Add componentProps min/max if they exist and are valid numbers
	if (field.componentProps?.min !== undefined && field.componentProps.min !== null) {
		inputAttrs.min = Number(field.componentProps.min);
	}
	if (field.componentProps?.max !== undefined && field.componentProps.max !== null) {
		inputAttrs.max = Number(field.componentProps.max);
	}
</script>

<NumberInputDecimal
	{...inputAttrs}
	bind:value
	locale={appSettings.get().userLocale}
	step={field.step}
	formatOptions={{
		minimumFractionDigits: field.fraction,
		maximumFractionDigits: field.fraction
	}}
/>
