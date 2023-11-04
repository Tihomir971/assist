import { getContext, setContext } from 'svelte';
import { createCombobox, type Combobox, type CreateComboboxProps } from '@melt-ui/svelte';
import type { ComboboxOptions } from './types';

const NAME = 'combobox';

export function setCtx(props: CreateComboboxProps<ComboboxOptions> | undefined) {
	const combobox = createCombobox({ ...props, forceVisible: true });
	setContext(NAME, combobox);
	return {
		...combobox
	};
}

export function getCtx() {
	return getContext<Combobox>(NAME);
}

export function getContent() {
	const menu = getCtx();

	return menu;
}
