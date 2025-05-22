import * as combobox from '@zag-js/combobox';

export interface ComboboxProps<T extends ComboboxItem>
	extends Omit<combobox.Props, 'id' | 'collection' | 'value'> {
	/** Provide the list of label and value data */
	items?: T[];
	label?: string;
	inline?: boolean;
	value?: number | null;
}
export interface ComboboxProps2<T extends ComboboxItem>
	extends Pick<combobox.Props, 'placeholder' | 'readOnly' | 'disabled'> {
	/** Provide the list of label and value data */
	items?: T[];
	label?: string;
	inline?: boolean;
}

export interface ComboboxItem {
	value: number;
	label: string;
}
