import { getContext, setContext } from 'svelte';
import {
	createCombobox,
	type Combobox,
	type CreateComboboxProps,
	type ComboboxOptionProps
} from '@melt-ui/svelte';
import type { ComboboxOptions } from './types';
import { removeUndefined } from '../internal';

const NAME = 'combobox';
const ITEM_NAME = 'combobox-item';

type GetReturn = Combobox;

export function setCtx(props: CreateComboboxProps<ComboboxOptions>) {
	const combobox = createCombobox({ ...removeUndefined(props), forceVisible: true });
	setContext(NAME, combobox);
	return {
		...combobox
	};
}

export function getCtx() {
	return getContext<GetReturn>(NAME);
}

export function getContent() {
	const menu = getCtx();

	return menu;
}

export function setItem(props: ComboboxOptionProps) {
	setContext(ITEM_NAME, { ...props });
	const {
		elements: { option }
	} = getCtx();
	return { option, props };
}
export function getItemProps() {
	const itemProps = getContext<ComboboxOptionProps>(ITEM_NAME);
	return itemProps;
}
