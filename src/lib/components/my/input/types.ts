import type { HTMLInputAttributes } from 'svelte/elements';

export interface InputProps extends Omit<HTMLInputAttributes, 'value' | 'name' | 'class'> {
	/** Provide the list of label and value data */
	inline?: boolean;
	label?: string;
}
