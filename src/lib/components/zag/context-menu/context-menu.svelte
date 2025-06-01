<script lang="ts">
	import './context-menu.css';
	import * as menu from '@zag-js/menu';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import { setContext } from 'svelte';
	import { CONTEXT_MENU_KEY } from './constants';
	import type { MenuSelected } from './types';

	const { onSelect, children }: MenuSelected = $props();

	const id = $props.id();
	const service = useMachine(menu.machine, {
		id,
		onSelect
	});

	const api = $derived(menu.connect(service, normalizeProps));

	setContext(CONTEXT_MENU_KEY, () => api);
</script>

{@render children()}
