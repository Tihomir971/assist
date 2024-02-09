import { getContext, setContext } from 'svelte';
import { type CreateTreeViewProps, createTreeView } from '@melt-ui/svelte';
//import { removeUndefined } from '../internal';
import type { GetReturn } from './types';

const NAME = 'tree';

export function setCtx(props: CreateTreeViewProps) {
	const treeview = createTreeView({ ...props });

	setContext(NAME, treeview);
	return {
		...treeview
	};
}

export function getCtx(): GetReturn {
	return getContext<GetReturn>(NAME);
}
