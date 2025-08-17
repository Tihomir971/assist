<script lang="ts">
	import { NumberInputZag } from '$lib/components/zag';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer4';

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

<NumberInputZag
	{...inputAttrs}
	value={value ?? undefined}
	onValueChange={(details) => {
		value = Number.isNaN(details.valueAsNumber) ? null : details.valueAsNumber;
	}}
	step={field.step ?? 1}
	fraction={field.fraction}
/>
