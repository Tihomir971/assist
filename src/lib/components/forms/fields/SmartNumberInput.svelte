<script lang="ts">
	import { NumberInputDecimal } from '$lib/components/ark';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';
	import type { NumberInputProps } from '$lib/components/ark/number-input/types';
	import { appSettings } from '$lib/context';

	interface SmartNumberInputProps {
		field: AnalyzedFieldConfig & {
			componentProps?: Partial<NumberInputProps>;
			locale?: string;
			formatOptions?: Intl.NumberFormatOptions;
		};
		value: number | null | undefined;
	}

	let { field, value = $bindable(), ...restProps }: SmartNumberInputProps = $props();
	const inputAttrs = {
		...restProps,
		...(field.placeholder && { placeholder: field.placeholder }),
		...(field.readonly && { readonly: field.readonly }),
		...(field.disabled && { disabled: field.disabled })
	};
	console.log('field:', field);
</script>

<NumberInputDecimal
	{...inputAttrs}
	{...field.componentProps}
	bind:value
	locale={field.locale || field.componentProps?.locale || appSettings.get().userLocale}
/>
