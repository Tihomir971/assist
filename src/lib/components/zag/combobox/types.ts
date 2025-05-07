import * as combobox from '@zag-js/combobox';

export interface ComboboxProps<T extends ComboboxItem>
	extends Omit<combobox.Props, 'id' | 'collection' | 'value'> {
	/** Provide the list of label and value data */
	items?: T[];
	label?: string;
	inline?: boolean;
	value?: number | null;
}

export interface ComboboxItem {
	value: number;
	label: string;
}
