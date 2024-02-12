import Root from './components/Root.svelte';
import Trigger from './components/Trigger.svelte';
import Portalled from '$lib/components/dialog/components/Portalled.svelte';
export { getCtx } from './ctx';

export const Dialog = {
	Root: Root,
	Trigger: Trigger,
	Portalled: Portalled
};
