<script lang="ts">
	import './context-menu-item.css';
	import type * as menu from '@zag-js/menu';
	import { getContext, type Snippet } from 'svelte';
	import { CONTEXT_MENU_KEY } from './constants';

	type ContextMenuAPIGetter = () => ReturnType<typeof menu.connect>;

	type Props = {
		value: string;
		disabled?: boolean;
		children: Snippet;
	};
	const { value, disabled = false, children }: Props = $props();

	const getApi = getContext<ContextMenuAPIGetter>(CONTEXT_MENU_KEY);
	const api = $derived(getApi());
</script>

<li {...api.getItemProps({ value, disabled })} class="text-sm">
	{@render children()}
</li>
