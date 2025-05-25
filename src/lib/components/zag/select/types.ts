import type { ControlAttrs } from 'formsnap';
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

// Generic ComboboxItem with number default for backward compatibility
export interface SelectItem2<T = number | string> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface SelectProps2<T extends SelectItem2>
	extends Pick<select.Props, 'readOnly' | 'disabled' | 'required' | 'onValueChange'>,
		Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>> {
	value?: number | string | null | undefined;
	items?: T[];
	label?: string;
	placeholder?: string;
}
