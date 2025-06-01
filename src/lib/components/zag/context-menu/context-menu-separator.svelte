<script lang="ts">
	import './context-menu-separator.css';
	import type * as menu from '@zag-js/menu';
	import { getContext } from 'svelte';
	import { CONTEXT_MENU_KEY } from './constants';

	type ContextMenuAPIGetter = () => ReturnType<typeof menu.connect>;

	const getApi = getContext<ContextMenuAPIGetter>(CONTEXT_MENU_KEY);
	const api = $derived(getApi());
</script>

<li {...api.getSeparatorProps()}></li>
