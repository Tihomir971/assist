<script lang="ts">
	import type * as menu from '@zag-js/menu';
	import { getContext, type Snippet } from 'svelte';
	import { CONTEXT_MENU_KEY } from './constants';
	// import './menu.css';
	type ContextMenuAPIGetter = () => ReturnType<typeof menu.connect>;

	type Props = {
		class?: string;
		children: Snippet;
	};
	const { class: className, children }: Props = $props();

	const getApi = getContext<ContextMenuAPIGetter>(CONTEXT_MENU_KEY);
	const api = $derived(getApi());
</script>

<div {...api.getContextTriggerProps()} class={className}>
	{@render children()}
</div>
