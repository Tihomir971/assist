import type { SelectRootProps } from 'bits-ui';
export type SelectItem = {
	value: string;
	label: string;
	disabled?: boolean;
};

export interface SelectProps extends Omit<SelectRootProps, 'value'> {
	value?: string;
	items: SelectItem[];
	placeholder?: string;
	readonly?: boolean;
}
