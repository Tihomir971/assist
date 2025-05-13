<script lang="ts">
	import type * as menu from '@zag-js/menu';
	import { getContext, type Snippet } from 'svelte';
	import { CONTEXT_MENU_KEY } from './constants';
	// import './menu.css';
	type ContextMenuAPIGetter = () => ReturnType<typeof menu.connect>;

	type Props = {
		value: string;
		disabled?: boolean;
		class?: string;
		children: Snippet;
	};
	const { value, disabled = false, class: className, children }: Props = $props();

	const getApi = getContext<ContextMenuAPIGetter>(CONTEXT_MENU_KEY);
	const api = $derived(getApi());

	const itemProps = $derived(api.getItemProps({ value, disabled }));
</script>

<li {...itemProps} class={className}>
	{@render children()}
</li>
