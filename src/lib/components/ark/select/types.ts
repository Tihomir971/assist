import type { SelectRootBaseProps } from '@ark-ui/svelte/select';

export interface Item<T = number | string> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface SelectProps<T extends Item>
	extends Omit<SelectRootBaseProps, 'value' | 'readOnly' | 'collection'> {
	value?: number | string | null;
	readonly?: boolean;
	items: T[];
	label?: string;
	placeholder?: string;
}
