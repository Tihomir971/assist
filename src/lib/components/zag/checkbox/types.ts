import * as checkbox from '@zag-js/checkbox';
import type { ControlAttrs } from 'formsnap';

export interface CheckboxProps
	extends Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>>,
		Pick<checkbox.Props, 'checked' | 'readOnly' | 'disabled' | 'required' | 'onCheckedChange'> {
	label?: string;
}
