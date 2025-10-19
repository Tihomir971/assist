import type { NumberInputProps } from '$lib/components/ark/number-input/types';
import type {
	SmartFormConfig,
	FieldOverride,
	FormConfigBuilder,
	ComponentPropsByFieldType,
	TextInputProps,
	BooleanInputProps,
	SelectInputProps,
	ComboboxInputProps,
	TextareaInputProps,
	DateInputProps,
	DatetimeInputProps,
	FieldOverrideWithTypedProps
} from '$lib/types/form-config.types';

export function createFormConfig<T extends Record<string, unknown>>(): FormConfigBuilder<T> {
	const config: SmartFormConfig = {
		fieldOverrides: {}
	};

	return {
		title(title: string) {
			config.title = title;
			return this;
		},

		description(description: string) {
			config.description = description;
			return this;
		},

		// Type-safe field method with explicit field type
		fieldTyped<K extends keyof T, TFieldType extends keyof ComponentPropsByFieldType>(
			fieldName: K,
			override: FieldOverrideWithTypedProps<TFieldType>
		): FormConfigBuilder<T> {
			if (!config.fieldOverrides) {
				config.fieldOverrides = {};
			}
			config.fieldOverrides[fieldName as string] = override;
			return this;
		},
		// Legacy method for backward compatibility (less type-safe)
		/* 		field<K extends keyof T>(fieldName: K, override: FieldOverride) {
			if (!config.fieldOverrides) {
				config.fieldOverrides = {};
			}
			config.fieldOverrides[fieldName as string] = override;
			return this;
		}, */

		multilingualInput<K extends keyof T>(
			fieldName: K,
			options: Omit<FieldOverride, 'type' | 'multilingualConfig'> & {
				requiredLocales?: string[];
				defaultLocale?: string;
				showAddLocale?: boolean;
				copyBetweenLocales?: boolean;
				enableCopyPaste?: boolean;
				enableSuggestions?: boolean;
				autoSave?: boolean;
				autoSaveDelay?: number;
			} = {}
		) {
			return this.fieldTyped(fieldName, {
				...options,
				type: 'multilingual_input',
				multilingualConfig: {
					required: options.requiredLocales,
					defaultLocale: options.defaultLocale
				}
			} as FieldOverride);
		},

		multilingualTextarea<K extends keyof T>(
			fieldName: K,
			options: Omit<FieldOverride, 'type' | 'multilingualConfig'> & {
				requiredLocales?: string[];
				defaultLocale?: string;
				showAddLocale?: boolean;
				copyBetweenLocales?: boolean;
				autoResize?: boolean;
				autoSave?: boolean;
				autoSaveDelay?: number;
				rows?: number;
			} = {}
		) {
			return this.fieldTyped(fieldName, {
				...options,
				type: 'multilingual_textarea',
				multilingualConfig: {
					required: options.requiredLocales,
					defaultLocale: options.defaultLocale
				}
			} as FieldOverride);
		},

		cardProps(props: SmartFormConfig['cardProps']) {
			config.cardProps = props;
			return this;
		},

		gap(size: SmartFormConfig['gap']) {
			config.gap = size;
			return this;
		},

		build(): SmartFormConfig {
			return config;
		}
	};
}

// Simple helper functions for common field configurations
export const fieldConfigs = {
	hidden: (): Pick<FieldOverride, 'hidden'> => ({ hidden: true }),
	readonly: (): Pick<FieldOverride, 'readonly'> => ({ readonly: true }),

	select: (options: Array<{ value: string | number; label: string }>, searchable = false) => ({
		componentProps: {
			options,
			searchable
		}
	}),

	number: (step: number) => ({
		type: 'number',
		componentProps: {
			step
		}
	}),

	// Type-safe helper functions for each field type
	textField: (props: Partial<TextInputProps> = {}) => ({
		type: 'text' as const,
		componentProps: props
	}),

	numberField: (props: Partial<NumberInputProps> = {}) => ({
		type: 'number' as const,
		componentProps: props
	}),

	booleanField: (props: Partial<BooleanInputProps> = {}) => ({
		type: 'boolean' as const,
		componentProps: props
	}),

	selectField: (props: Partial<SelectInputProps> = {}) => ({
		type: 'select' as const,
		componentProps: props
	}),

	comboboxField: (props: Partial<ComboboxInputProps> = {}) => ({
		type: 'combobox' as const,
		componentProps: props
	}),

	textareaField: (props: Partial<TextareaInputProps> = {}) => ({
		type: 'textarea' as const,
		componentProps: props
	}),

	dateField: (props: Partial<DateInputProps> = {}) => ({
		type: 'date' as const,
		componentProps: props
	}),

	datetimeField: (props: Partial<DatetimeInputProps> = {}) => ({
		type: 'datetime' as const,
		componentProps: props
	})
};
