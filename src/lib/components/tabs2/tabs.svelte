<script lang="ts">
	import { getContext } from 'svelte';
	import { melt, type Tabs } from '@melt-ui/svelte';
	import { getTabsContext } from './tabs-list.svelte';

	/**
	 * Provide the key of the tab content.
	 * Should be the same as the header key it belongs to.
	 * */
	export let key: string;

	const { content } = getTabsContext();
</script>

<div use:melt={$content(key)}>
	<slot />
</div>
