import type { createTabs } from '@melt-ui/svelte';
import { getContext, setContext } from 'svelte';
import type { Writable } from 'svelte/store';

type CreateTabs = ReturnType<typeof createTabs>;
type Elements = CreateTabs['elements'];

/* type TabsContext = Pick<Elements, 'root' | 'content' | 'list' | 'trigger'> & { */
type TabsContext = Elements & {
	tabs: Writable<string[]>;
};

export const setCtx = (context: TabsContext) => {
	setContext('tabs', context);
};

export const getCtx = () => getContext<TabsContext>('tabs');
