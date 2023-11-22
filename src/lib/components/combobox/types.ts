import type { ComboboxOption } from '@melt-ui/svelte';

export type ExtendedComboboxOption<Value = unknown> = ComboboxOption<Value> & {
	description?: string;
	disabled?: boolean;
};
