import { createDialog, type CreateDialogProps, type Dialog } from '@melt-ui/svelte';
import { removeUndefined } from '../internal';
import { getContext, setContext } from 'svelte';

const NAME = 'dialog';
type GetReturn = Dialog;

export function setCtx(props: CreateDialogProps) {
	const dialog = createDialog({
		...removeUndefined(props),
		forceVisible: true
	});
	setContext(NAME, dialog);
	return {
		...dialog
	};
}

export function getCtx() {
	return getContext<GetReturn>(NAME);
}
