import type { CreateAvatarProps } from '@melt-ui/svelte';
import type { HTMLAttributes } from 'svelte/elements';
type HTMLDivAttributes = HTMLAttributes<HTMLDivElement>;

type Props = CreateAvatarProps & HTMLDivAttributes;

export type { Props };
