<script lang="ts">
	import type { TreeItem } from '..';
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import PhCaretRight from '$lib/icons/PhCaretRight.svelte';
	import PhDotBold from '$lib/icons/PhDotBold.svelte';
	import { cn } from '$lib/utils';
	import { slide } from 'svelte/transition';

	export let treeItems: TreeItem[];
	export let level = 1;

	const {
		elements: { item, group },
		helpers: { isExpanded, isSelected }
	} = getCtx();
	// Adjust this value to change the indentation size
	const INDENT_SIZE = 8; // reduced from 16
</script>

{#each treeItems as { id, title, icon, children }}
	{@const itemId = id.toString()}
	{@const hasChildren = !!children?.length}

	<li class="w-full list-none p-0">
		<div
			class={cn(
				'w-full rounded-md hover:bg-surface-2',
				$isSelected(itemId) ? 'bg-surface-document' : ''
			)}
		>
			<button
				type="button"
				class={cn(
					'flex w-full items-center gap-1 overflow-hidden text-ellipsis text-wrap px-2 py-2 text-left text-sm',
					$isSelected(itemId) ? 'text-secondary-foreground' : ''
				)}
				style="padding-left: {level * INDENT_SIZE}px;"
				use:melt={$item({
					id: itemId,
					hasChildren
				})}
			>
				<!-- Add icon. -->
				{#if hasChildren}
					<span
						class="size-4 flex-shrink-0 transition-transform duration-300"
						class:rotate-90={$isExpanded(itemId)}
					>
						<PhCaretRight class="size-4" />
					</span>
				{:else}
					<span class="size-4 flex-shrink-0">
						<PhDotBold class="size-4" />
					</span>
				{/if}
				<span class="truncate" {title}>
					{title}
				</span>
			</button>
		</div>

		{#if children}
			<ul use:melt={$group({ id: itemId })} class="w-full overflow-hidden p-0">
				<svelte:self treeItems={children} level={level + 1} on:select />
			</ul>
		{/if}
	</li>
{/each}
