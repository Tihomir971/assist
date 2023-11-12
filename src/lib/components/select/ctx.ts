import { createSelect, type CreateSelectProps, type Select } from '@melt-ui/svelte';
import { getContext, setContext } from 'svelte';
import { removeUndefined } from '../internal';

const NAME = 'select';
type CreateProps = CreateSelectProps;
type GetProps = Select;

export const setCtx = (props: CreateProps) => {
	const context = createSelect({ ...removeUndefined(props), forceVisible: true });
	setContext(NAME, context);
	return {
		...context
	};
};

export const getCtx = () => getContext<GetProps>(NAME);
