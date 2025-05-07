import * as zagSwitch from '@zag-js/switch';

export interface SwitchProps extends Omit<zagSwitch.Props, 'id' | 'value'> {
	/** Provide the list of label and value data */
	inline?: boolean;
}
