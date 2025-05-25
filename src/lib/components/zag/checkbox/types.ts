import * as checkbox from '@zag-js/checkbox';
import type { ControlAttrs } from 'formsnap';

export interface CheckboxProps
	extends Pick<
			checkbox.Props,
			'checked' | 'readOnly' | 'disabled' | 'required' | 'onCheckedChange'
		>,
		Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>> {
	label?: string;
}
