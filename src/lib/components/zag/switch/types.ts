import * as zagSwitch from '@zag-js/switch';
import type { ControlAttrs } from 'formsnap';

export interface SwitchProps
	extends Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>>,
		Pick<
			zagSwitch.Props,
			'readOnly' | 'required' | 'label' | 'checked' | 'disabled' | 'onCheckedChange'
		> {
	/** Provide the list of label and value data */
}
