import type { ControlAttrs } from 'formsnap';
import * as select from '@zag-js/select';

// Generic ComboboxItem with number default for backward compatibility
export interface SelectItem<T = number | string> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface SelectProps2<T extends SelectItem>
	extends Pick<select.Props, 'readOnly' | 'disabled' | 'required' | 'onValueChange'>,
		Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>> {
	value?: number | string | null | undefined;
	items?: T[];
	label?: string;
	placeholder?: string;
}
