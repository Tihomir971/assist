export { default as Root } from './Root.svelte';
export { default as Button } from './Button.svelte';
import {
	createToolbar,
	type CreateToolbarProps,
	type Toolbar as ToolbarType
} from '@melt-ui/svelte';
import Root from './Root.svelte';
import Button from './Button.svelte';

function createToolbarRegistry() {
	const registry = new Map<string, ToolbarType>();

	function get(name: string, props?: CreateToolbarProps) {
		if (!registry.has(name)) {
			const dialog = createToolbar(props);
			registry.set(name, dialog);
		}

		return registry.get(name) as ToolbarType;
	}

	function set(name: string, dialog: ToolbarType) {
		registry.set(name, dialog);
	}

	return {
		get,
		set
	};
}

export const toolbarRegistry = createToolbarRegistry();

export const Toolbar = {
	Root: Root,
	Button: Button
};
