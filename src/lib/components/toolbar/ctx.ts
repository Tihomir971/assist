import { createToolbar, type CreateToolbarProps } from '@melt-ui/svelte';
import { getContext, setContext } from 'svelte';
import { removeUndefined } from '../internal';

const NAME = 'toolbar' as const;
type SetProps = CreateToolbarProps;
type GetReturn = ReturnType<typeof setCtx>;

export function setCtx(props: SetProps) {
	const toolbar = {
		...createToolbar({ ...removeUndefined(props) })
	};

	setContext(NAME, toolbar);
	return {
		...toolbar
	};
}

export function getCtx() {
	return getContext<GetReturn>(NAME);
}
