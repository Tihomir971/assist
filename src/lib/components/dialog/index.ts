/* export { default as Dialog } from './components/dialog.svelte';
export { default as DialogTitle } from './components/title.svelte';
export { default as DialogPortalled } from './components/portalled.svelte'; */
import Root from './components/Root.svelte';
import Trigger from './components/Trigger.svelte';
import Portalled from './components/Portalled.svelte';
export { getCtx } from './ctx';

export const Dialog = {
	Root: Root,
	Trigger: Trigger,
	Portalled: Portalled
};
