import type { NumberInputProps } from '$lib/components/ark/number-input/types';

export interface MultilingualFieldConfig {
	required?: string[]; // Required locale codes
	defaultLocale?: string; // Default locale to use
}

export interface LookupOption {
	value: string | number;
	label: string;
	description?: string;
	disabled?: boolean;
}

// Type-safe component props for each field type
export interface TextInputProps {
	maxLength?: number;
	pattern?: string;
	inputMode?: 'text' | 'search' | 'email' | 'tel' | 'url' | 'none' | 'numeric' | 'decimal';
	autoComplete?: string;
	spellCheck?: boolean;
}

export interface BooleanInputProps {
	showLabel?: boolean;
	labelPosition?: 'left' | 'right';
	size?: 'sm' | 'md' | 'lg';
}

export interface SelectInputProps {
	options?: LookupOption[];
	searchable?: boolean;
	clearable?: boolean;
	creatable?: boolean;
	multi?: boolean;
	maxItems?: number;
	searchPlaceholder?: string;
	noResultsText?: string;
}

export interface ComboboxInputProps extends SelectInputProps {
	filterFunction?: (option: LookupOption, searchValue: string) => boolean;
}

export interface TextareaInputProps {
	rows?: number;
	resize?: 'none' | 'both' | 'horizontal' | 'vertical';
	autoResize?: boolean;
	maxLength?: number;
}

export interface DateInputProps {
	minDate?: Date;
	maxDate?: Date;
	disabledDates?: Date[];
	format?: string;
	locale?: string;
	clearable?: boolean;
}

export interface DatetimeInputProps extends DateInputProps {
	showTime?: boolean;
	timeFormat?: '12h' | '24h';
	timeInterval?: number;
}

export interface MultilingualInputProps extends TextInputProps {
	requiredLocales?: string[];
	defaultLocale?: string;
	showAddLocale?: boolean;
	copyBetweenLocales?: boolean;
	enableCopyPaste?: boolean;
	enableSuggestions?: boolean;
	autoSave?: boolean;
	autoSaveDelay?: number;
}

export interface MultilingualTextareaProps extends TextareaInputProps {
	requiredLocales?: string[];
	defaultLocale?: string;
	showAddLocale?: boolean;
	copyBetweenLocales?: boolean;
	autoSave?: boolean;
	autoSaveDelay?: number;
}

// Type mapping for componentProps based on field type
export type ComponentPropsByFieldType = {
	text: TextInputProps;
	number: NumberInputProps;
	boolean: BooleanInputProps;
	select: SelectInputProps;
	combobox: ComboboxInputProps;
	textarea: TextareaInputProps;
	date: DateInputProps;
	datetime: DatetimeInputProps;
	multilingual_input: MultilingualInputProps;
	multilingual_textarea: MultilingualTextareaProps;
};

// Helper type to extract component props for a specific field type
type ExtractComponentProps<TFieldType> = TFieldType extends keyof ComponentPropsByFieldType
	? Partial<ComponentPropsByFieldType[TFieldType]>
	: Record<string, unknown>;

export interface FieldOverride<
	TFieldType extends keyof ComponentPropsByFieldType | undefined = undefined
> {
	label?: string;
	placeholder?: string;
	description?: string;
	type?: TFieldType extends undefined
		?
				| 'text'
				| 'number'
				| 'boolean'
				| 'select'
				| 'combobox'
				| 'textarea'
				| 'date'
				| 'datetime'
				| 'multilingual_input'
				| 'multilingual_textarea'
		: TFieldType;
	hidden?: boolean;
	readonly?: boolean;
	order?: number; // For custom field ordering
	span?: number; // Grid column span (1-12 for CSS Grid)
	className?: string; // Additional CSS classes for the field container
	size?: 'sm' | 'md' | 'lg'; // Field size variant
	componentProps?: ExtractComponentProps<TFieldType>;
	multilingualConfig?: MultilingualFieldConfig;
}

// Enhanced FieldOverride with optional componentProps object
export type FieldOverrideWithTypedProps<TFieldType extends keyof ComponentPropsByFieldType> = Omit<
	FieldOverride<TFieldType>,
	'componentProps'
> & { componentProps?: ExtractComponentProps<TFieldType> };

export interface SmartFormConfig {
	title?: string;
	description?: string;
	fieldOverrides?: Record<string, FieldOverride<keyof ComponentPropsByFieldType | undefined>>;
	// Simplified: Always uses 12-column responsive grid (1 col on mobile, 12 cols on md+)
	showSystemFields?: boolean;
	cardProps?: {
		className?: string;
		showHeader?: boolean;
		showFooter?: boolean;
	};
	gap?: 'sm' | 'md' | 'lg'; // Grid gap size
}

// Type-safe form configuration builder
export interface FormConfigBuilder<T extends Record<string, unknown>> {
	title(title: string): FormConfigBuilder<T>;
	description(description: string): FormConfigBuilder<T>;
	// Type-safe field method with explicit field type
	fieldTyped<K extends keyof T, TFieldType extends keyof ComponentPropsByFieldType>(
		fieldName: K,
		override: FieldOverrideWithTypedProps<TFieldType>
	): FormConfigBuilder<T>;
	// Legacy method for backward compatibility (less type-safe)
	// field<K extends keyof T>(fieldName: K, override: FieldOverride): FormConfigBuilder<T>;
	multilingualInput<K extends keyof T>(
		fieldName: K,
		options: Omit<FieldOverride<'multilingual_input'>, 'type' | 'multilingualConfig'> & {
			requiredLocales?: string[];
			defaultLocale?: string;
			showAddLocale?: boolean;
			copyBetweenLocales?: boolean;
		}
	): FormConfigBuilder<T>;
	multilingualTextarea<K extends keyof T>(
		fieldName: K,
		options: Omit<FieldOverride<'multilingual_textarea'>, 'type' | 'multilingualConfig'> & {
			requiredLocales?: string[];
			defaultLocale?: string;
			showAddLocale?: boolean;
			copyBetweenLocales?: boolean;
		}
	): FormConfigBuilder<T>;
	cardProps(props: SmartFormConfig['cardProps']): FormConfigBuilder<T>;
	gap(size: SmartFormConfig['gap']): FormConfigBuilder<T>;
	build(): SmartFormConfig;
}
