<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from './ctx';

	/**
	 * Provide the key of the tab content.
	 * Should be the same as the header key it belongs to.
	 * */
	export let key: string;

	const { content } = getCtx();
</script>

<div use:melt={$content(key)}>
	<slot />
</div>
