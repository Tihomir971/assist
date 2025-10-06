import type { NumberInputRootBaseProps } from '@ark-ui/svelte/number-input';

export interface NumberInputProps extends Omit<NumberInputRootBaseProps, 'value' | 'readOnly'> {
	value?: number | null;
	readonly?: boolean;
	label?: string;
}
