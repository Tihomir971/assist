import type { CheckboxGroupProps, CheckboxRootProps } from '@ark-ui/svelte/checkbox';

export interface CheckboxRootPropsExtended extends CheckboxRootProps {
	label?: string;
	description?: string;
}
export interface CheckboxGroupPropsExtended extends CheckboxGroupProps {
	label?: string;
	description?: string;
	items: { value: string | number; label: string; selected: boolean }[];
}
