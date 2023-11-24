import type { CreateAvatarProps, Avatar as AvatarReturn } from '@melt-ui/svelte';
import { createAvatar } from '@melt-ui/svelte';
import { getContext, setContext } from 'svelte';
import { getOptionUpdater, removeUndefined } from '../internal';

const NAME = 'avatar';

export function setCtx(props: CreateAvatarProps) {
	const avatar = createAvatar(removeUndefined(props));
	setContext(NAME, avatar);
	return {
		...avatar,
		updateOption: getOptionUpdater(avatar.options)
	};
}

export function getCtx() {
	return getContext<AvatarReturn>(NAME);
}
