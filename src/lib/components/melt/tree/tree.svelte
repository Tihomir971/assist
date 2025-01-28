<script lang="ts">
	import { Tree } from 'melt/builders';
	// Icons
	import PhCaretRight from '~icons/ph/caret-right';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhDotOutline from '~icons/ph/dot-outline';
	import { fade } from 'svelte/transition';
	import type { TreeItemTitle } from './types';
	import { findParent } from '$lib/scripts/tree';
	import { page } from '$app/state';

	type Props = {
		treeData: TreeItemTitle[];
		onSelectedChange: (value: string | undefined) => void;
	};
	let { treeData, onSelectedChange }: Props = $props();

	const selected = page.url.searchParams.get('cat');
	const tree = new Tree({
		items: treeData,
		expanded: findParent(treeData, selected),
		expandOnClick: true,
		selected: selected ?? undefined,
		onSelectedChange
	});
</script>

{#snippet treeItemIcon(item: (typeof tree)['children'][number])}
	<!-- {@const icon = item.item.icon} -->

	{#if item.children?.length}
		{@const SvelteComponent = item.expanded ? PhCaretDown : PhCaretRight}
		<SvelteComponent role="presentation" />
	{:else}
		<PhDotOutline role="presentation" />
	{/if}
{/snippet}

{#snippet treeItems(items: (typeof tree)['children'], depth: number = 0)}
	{#each items as item (item.id)}
		<li {...item.attrs} class="cursor-pointer outline-none first:mt-0">
			<div class="group relative transition-colors" style="padding-left: {depth * 1}rem">
				<div class="absolute inset-0 z-0">
					{#if item.selected}
						<div class="absolute inset-0 rounded-md bg-surface-document"></div>
					{/if}
					<div class="absolute inset-0 rounded-md group-hover:bg-surface-2"></div>
				</div>
				<div class="relative z-10 flex items-center gap-1 px-3 py-2 text-sm">
					<div class="size-4">{@render treeItemIcon(item)}</div>
					<span class="truncate">
						{item.item.title}
					</span>
				</div>
			</div>
			{#if item.children?.length && item.expanded}
				<div {...tree.group} class="list-none p-0" transition:fade>
					{@render treeItems(item.children, depth + 1)}
				</div>
			{/if}
		</li>
	{/each}
{/snippet}
<ul class="mx-auto list-none rounded-md py-4" {...tree.root}>
	{@render treeItems(tree.children, 0)}
</ul>
