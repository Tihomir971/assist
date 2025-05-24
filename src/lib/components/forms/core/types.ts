import type { SuperForm, FormPath, FormFieldProxy } from 'sveltekit-superforms';

// Base option interface for all select-type components
export interface ComboboxOption {
	value: number;
	label: string;
	disabled?: boolean;
}

// Base props that all form components share
export interface BaseFormProps<T extends Record<string, unknown> = Record<string, unknown>> {
	// Superforms integration (optional)
	form?: SuperForm<T>;
	name?: FormPath<T>;

	// Common styling and behavior
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;

	// Error handling for standalone mode
	invalid?: boolean;
	errors?: string[];

	// CSS classes
	class?: string;
}

// Combobox-specific props
export interface ComboboxProps<T extends Record<string, unknown> = Record<string, unknown>>
	extends BaseFormProps<T> {
	// Standalone mode value binding
	value?: number | null | undefined;

	// Options and behavior
	options: ComboboxOption[];
	allowCustomValue?: boolean;
	closeOnSelect?: boolean;

	// Event handlers for standalone mode
	onValueChange?: (value: number | null | undefined) => void;
	onSelectionChange?: (option: ComboboxOption | null) => void;
}

// Form field proxy type for internal use
export interface FormFieldContext {
	isFormMode: boolean;
	name: FormPath<Record<string, unknown>>; // Added name property
	fieldProxy?: FormFieldProxy<number | null | undefined>;
	readonly currentValue: number | undefined;
	readonly currentErrors: string[] | undefined;
	readonly currentConstraints: Record<string, unknown> | undefined;
	readonly currentTainted: boolean;
}

// Utility type to detect if component is in form mode
export type FormMode<T extends Record<string, unknown>> = {
	form: SuperForm<T>;
	name: FormPath<T>;
};
