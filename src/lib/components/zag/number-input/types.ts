import * as numberInput from '@zag-js/number-input';

export interface NumberInputProps extends Omit<numberInput.Props, 'id' | 'value'> {
	value?: number;
	label?: string;
	required?: boolean;
	inline?: boolean;
}
