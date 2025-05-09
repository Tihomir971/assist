import * as select from '@zag-js/select';

export interface SelectProps<T extends SelectItem>
	extends Omit<select.Props, 'id' | 'collection' | 'value'> {
	/** Provide the list of label and value data */
	items?: T[];
	label?: string;
	inline?: boolean;
	value?: number | null;
}

export interface SelectItem {
	value: number;
	label: string;
}

export interface SelectSimpleProps<T extends SelectSimpleItem>
	extends Omit<select.Props, 'id' | 'collection' | 'value'> {
	/** Provide the list of label and value data */
	items?: T[];
	label?: string;
	inline?: boolean;
	value?: string | number | null;
}
export interface SelectSimpleItem {
	value: string | number;
	label: string;
}
