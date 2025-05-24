import * as combobox from '@zag-js/combobox';
import type { ControlProps } from 'formsnap';

// Generic ComboboxItem with number default for backward compatibility
export interface ComboboxItem<T = number> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface ComboboxProps<T extends ComboboxItem>
	extends Omit<combobox.Props, 'id' | 'collection' | 'value' | 'readOnly'>,
		ControlProps {
	value?: number | null;
	options?: T[];
	label?: string;
	readonly?: boolean;
}
