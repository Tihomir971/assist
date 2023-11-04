import { getContext, setContext } from 'svelte';
import {
	createDropdownMenu,
	type CreateDropdownMenuProps,
	type DropdownMenu
} from '@melt-ui/svelte';

const NAME = 'dropdown-menu';

export function getCtx() {
	return getContext<DropdownMenu>(NAME);
}

export function setCtx(props: CreateDropdownMenuProps | undefined) {
	const dropdownMenu = createDropdownMenu({ ...props, forceVisible: true });
	setContext(NAME, dropdownMenu);
	return {
		...dropdownMenu
	};
}

export function getContent() {
	const menu = getCtx();

	return menu;
}
