<script lang="ts">
	import './context-menu.css';
	import * as menu from '@zag-js/menu';
	import { normalizeProps, useMachine } from '@zag-js/svelte'; // Removed unused 'Service'
	import { setContext, type Snippet } from 'svelte'; // Imported Snippet
	import { CONTEXT_MENU_KEY } from './constants'; // We'll create this constant file next

	type Props = {
		onSelect?: (details: menu.SelectionDetails) => void;
		children: Snippet;
	};

	const { onSelect, children }: Props = $props();

	const id = $props.id();

	const service = useMachine(menu.machine, {
		id,
		onSelect: onSelect
		// Add other relevant machine options here if needed, e.g., positioning, closeOnSelect
	});

	// connect uses the service instance
	const api = $derived(menu.connect(service, normalizeProps));

	// Pass a getter function for the reactive api to context
	setContext(CONTEXT_MENU_KEY, () => api);
</script>

{@render children()}
