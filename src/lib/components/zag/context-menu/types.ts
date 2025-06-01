import * as menu from '@zag-js/menu';
import type { Snippet } from 'svelte';

export type MenuSelected = Pick<menu.Props, 'onSelect'> & { children: Snippet };
