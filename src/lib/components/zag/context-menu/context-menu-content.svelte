<script lang="ts">
	// import './menu.css'; // Import the base styles
	import type * as menu from '@zag-js/menu';
	import { portal } from '@zag-js/svelte'; // Import portal action
	import { getContext, type Snippet } from 'svelte';
	import { CONTEXT_MENU_KEY } from './constants';

	type ContextMenuAPIGetter = () => ReturnType<typeof menu.connect>;

	type Props = {
		class?: string;
		children: Snippet;
	};
	const { class: className, children }: Props = $props();

	const getApi = getContext<ContextMenuAPIGetter>(CONTEXT_MENU_KEY);
	const api = $derived(getApi());
</script>

{#if api.open}
	<div use:portal {...api.getPositionerProps()}>
		<ul {...api.getContentProps()} class={className}>
			{@render children()}
		</ul>
	</div>
{/if}
