import * as combobox from '@zag-js/combobox';

// Generic ComboboxItem with number default for backward compatibility
export interface ComboboxItem<T = number> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface ComboboxProps<T extends ComboboxItem>
	extends Omit<combobox.Props, 'id' | 'collection' | 'value'> {
	items?: T[];
	label?: string;
	value?: number | null;
}
