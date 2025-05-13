<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Tree, type TreeItem } from 'melt/builders';
	// Icons
	import PhCaretRight from '~icons/ph/caret-right';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhDotOutline from '~icons/ph/dot-outline';
	import type { SvelteSet } from 'svelte/reactivity';
	import type { MaybeGetter } from 'melt';
	import { findParent } from '$lib/scripts/tree';

	type CustomTreeItem = TreeItem & {
		title: string;
		children?: CustomTreeItem[];
	};

	type Props = {
		items: CustomTreeItem[];
		selected: MaybeGetter<string | undefined>;
		expanded?: SvelteSet<string> | MaybeGetter<Iterable<string> | undefined>;
		onSelectedChange: (value: string | undefined) => void;
	};
	let { items, selected, onSelectedChange }: Props = $props();

	const tree = new Tree({
		items: items,
		expanded: findParent(items, selected),
		expandOnClick: true,
		selected: selected ?? undefined,
		onSelectedChange
	});
</script>

{#snippet treeItemIcon(item: (typeof tree)['children'][number])}
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
			<div class="group relative" style="padding-left: {depth * 1}rem">
				<div
					class="absolute inset-0 z-10 rounded-md transition-colors group-hover:bg-muted/50"
				></div>
				{#if item.selected}
					<div class="absolute inset-0 rounded-md bg-muted"></div>
				{/if}
				<div class="relative z-10 flex items-center gap-1 px-3 py-2">
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
