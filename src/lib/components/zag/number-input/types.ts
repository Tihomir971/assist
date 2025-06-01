import * as numberInput from '@zag-js/number-input';
import type { ControlAttrs } from 'formsnap';

export interface NumberInputProps
	extends Pick<
			numberInput.Props,
			| 'disabled'
			| 'readOnly'
			| 'invalid'
			| 'required'
			| 'formatOptions'
			| 'locale'
			| 'min'
			| 'max'
			| 'step'
			| 'onValueChange'
		>,
		Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>> {
	value?: number;
	label?: string;
	fraction?: number;
}
