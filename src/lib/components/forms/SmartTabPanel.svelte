<script lang="ts">
	import type { SmartTabPanelProps } from '$lib/types/split-layout-config.types';
	import { cn } from '$lib/utils';

	let { tabId, isActive, className, children }: SmartTabPanelProps = $props();
</script>

<div
	class={cn('smart-tab-panel', 'h-full w-full', !isActive && 'hidden', className)}
	role="tabpanel"
	aria-labelledby={`tab-${tabId}`}
	data-tab-id={tabId}
>
	{#if children}
		{@render children()}
	{/if}
</div>
