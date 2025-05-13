<script lang="ts">
	import type * as menu from '@zag-js/menu';
	import { getContext } from 'svelte';
	import { CONTEXT_MENU_KEY } from './constants';
	// import './menu.css';
	type ContextMenuAPIGetter = () => ReturnType<typeof menu.connect>;
	type Props = {
		class?: string;
	};

	const { class: className }: Props = $props();
	const getApi = getContext<ContextMenuAPIGetter>(CONTEXT_MENU_KEY);
	const api = $derived(getApi());

	// Use getSeparatorProps for potential future attributes or accessibility
	const separatorProps = $derived(api.getSeparatorProps());
</script>

<li {...separatorProps} class={className}></li>

<style>
	/* Basic separator style, can be overridden by className prop */
	li {
		height: 1px;
		margin: 0.5rem 0;
		background-color: var(--color-surface-2); /* Assuming you have Tailwind/Shadcn vars */
		/* Or use a standard color: background-color: lightgray; */
	}
</style>
