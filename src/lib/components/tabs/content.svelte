<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import { melt } from '@melt-ui/svelte';
	import { getTabsContext } from './root.svelte';

	const { content } = getTabsContext();

	let className = '';
	export { className as class };
</script>

<div use:melt={$content} class={cn('grow bg-white p-5', className)}>
	<slot {content} />
</div>
