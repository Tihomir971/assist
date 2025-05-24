// Export core types and utilities
export type {
	ComboboxOption,
	ComboboxProps,
	BaseFormProps,
	FormFieldContext
} from './core/types.js';
export { filterOptions, findOptionByValue, getDisplayValue } from './core/utils.js';

// Export main components
export { default as FormField } from './form-field.svelte';
export { default as Combobox } from './combobox/combobox.svelte';

// Export new enhanced components for props spreading pattern
export { default as EnhancedFormField } from './enhanced/enhanced-form-field.svelte';
export type { EnhancedFormFieldProps, FieldContext } from './enhanced/enhanced-form-field.svelte';
export { default as FormControl } from './enhanced/form-control.svelte';
export type { FormControlProps, FormControlComponentProps } from './enhanced/form-control.svelte';
export { default as FormLabel } from './enhanced/form-label.svelte';
export type { FormLabelProps } from './enhanced/form-label.svelte';
export { default as FormDescription } from './enhanced/form-description.svelte';
export type { FormDescriptionProps } from './enhanced/form-description.svelte';
export { default as FormFieldErrors } from './enhanced/form-field-errors.svelte';
export type { FormFieldErrorsProps } from './enhanced/form-field-errors.svelte';
export { default as EnhancedCombobox } from './enhanced/enhanced-combobox.svelte';

// CSS styles need to be imported separately
// Import './core/styles.css' in your app.css or main CSS file
// Consider if enhanced components need separate or shared styles
