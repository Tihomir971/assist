<script lang="ts">
	import type { SmartRelatedTabsProps, TabConfig } from '$lib/types/split-layout-config.types';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	let {
		tabs,
		defaultTab,
		orientation = 'horizontal',
		variant = 'default',
		className,
		onTabChange
	}: SmartRelatedTabsProps = $props();

	// Sort tabs by order if specified
	const sortedTabs = $derived([...tabs].sort((a, b) => (a.order || 0) - (b.order || 0)));

	// Get the active tab ID - use derived to properly handle the initial value
	let activeTab = $state(defaultTab || tabs[0]?.id);

	// Handle tab change
	function handleTabChange(tabId: string | undefined) {
		if (tabId) {
			activeTab = tabId;
			onTabChange?.(tabId);
		}
	}

	// Get active tab configuration
	const activeTabConfig = $derived(sortedTabs.find((tab) => tab.id === activeTab));
</script>

<div class={cn('smart-related-tabs', className)}>
	<Tabs.Root value={activeTab} onValueChange={handleTabChange} {orientation}>
		<Tabs.List
			class={cn(
				'grid w-full',
				orientation === 'horizontal'
					? 'grid-cols-[repeat(var(--cols),minmax(0,1fr))]'
					: 'grid-cols-1',
				variant === 'pills' && 'rounded-lg bg-muted p-1',
				variant === 'underline' && 'border-b'
			)}
			style={`--cols: ${sortedTabs.length}`}
		>
			{#each sortedTabs as tab (tab.id)}
				<Tabs.Trigger
					value={tab.id}
					disabled={tab.disabled}
					class={cn(
						'flex items-center justify-center gap-2',
						variant === 'pills' &&
							'data-[state=active]:bg-background data-[state=active]:shadow-sm',
						variant === 'underline' &&
							'border-b-2 border-transparent data-[state=active]:border-primary'
					)}
				>
					{#if tab.icon}
						<i class={tab.icon}></i>
					{/if}
					<span>{tab.label}</span>
					{#if tab.badge !== undefined}
						<Badge variant="secondary" class="ml-1 text-xs">
							{tab.badge}
						</Badge>
					{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>

		{#each sortedTabs as tab (tab.id)}
			<Tabs.Content value={tab.id} class="mt-4">
				{#if tab.description}
					<div class="mb-4 text-sm text-muted-foreground">
						{tab.description}
					</div>
				{/if}
				{@const Component = tab.component}
				<Component {...tab.props} />
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
