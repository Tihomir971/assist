import * as combobox from '@zag-js/combobox';
import type { ControlAttrs } from 'formsnap';

// Generic ComboboxItem with number default for backward compatibility
export interface ComboboxItem<T = number> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface ComboboxProps<T extends ComboboxItem>
	extends Pick<combobox.Props, 'readOnly' | 'disabled' | 'required' | 'placeholder'>,
		Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>> {
	value?: number | string | null | undefined;
	items?: T[];
	label?: string;
}
