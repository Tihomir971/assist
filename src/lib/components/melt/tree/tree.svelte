<script lang="ts">
	import { Tree, type TreeItem } from 'melt/builders';
	// Icons
	import JavaScript from '~icons/devicon/javascript';
	import Svelte from '~icons/devicon/svelte';
	import PhFolder from '~icons/ph/folder';
	import PhFolderOpen from '~icons/ph/folder-open';
	import PhFolderFill from '~icons/ph/folder-fill';
	import PhCaretRight from '~icons/ph/caret-right';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhDotOutline from '~icons/ph/dot-outline';
	import { fade } from 'svelte/transition';
	import type { TreeItemTitle } from './types';

	type Props = {
		treeData: TreeItemTitle[];
	};
	let { treeData }: Props = $props();
	/* const data: Item[] = [
		{
			id: '1',
			title: 'Audio Visual/Photography'
		},
		{
			id: '2',
			title: 'Automotive Accessories and Maintenance',
			children: [
				{
					id: '3',
					title: 'Child Root 2',
					children: [
						{
							id: '4',
							title: 'Tree.svelte'
						},
						{
							id: '5',
							title: 'TreeItem.svelte'
						}
					]
				},
				{
					id: '6',
					title: 'icons',
					children: [
						{
							id: '7',
							title: 'JavaScript.svelte'
						},
						{
							id: '8',
							title: 'Svelte.svelte'
						}
					]
				},
				{
					id: '9',
					title: 'index.js'
				}
			]
		},
		{
			id: '10',
			title: 'Beauty/Personal Care/Hygiene',
			children: [
				{
					id: 'routes/contents',
					title: 'contents',
					children: [
						{
							id: 'routes/contents/+layout.svelte',
							title: '+layout.svelte'
						},
						{
							id: 'routes/contents/+page.svelte',
							title: '+page.svelte'
						}
					]
				}
			]
		}
	]; */

	const tree = new Tree({
		items: treeData,
		expanded: ['lib', 'routes'],
		expandOnClick: true
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
	<!-- <svelte:component this={item.selected ? PhFolderFill : PhFolder} role="presentation" /> -->
	<!-- {#if item.selected} -->
	<!-- {:else if icon === 'svelte'}
		<Svelte role="presentation" /> -->
	<!-- {:else} -->
	<!-- {/if} -->
{/snippet}

{#snippet treeItems(items: (typeof tree)['children'], depth: number = 0)}
	{#each items as item (item.id)}
		<li {...item.attrs} class="cursor-pointer outline-none first:mt-0">
			<div class="group relative transition-colors" style="padding-left: {depth * 1}rem">
				<div class="absolute inset-0 z-0">
					{#if item.selected}
						<div class="bg-surface-document absolute inset-0 rounded-md"></div>
					{/if}
					<div class="group-hover:bg-surface-2 absolute inset-0 rounded-md"></div>
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
<div>{tree.selected}</div>
<ul class="mx-auto w-[300px] list-none rounded-md p-4" {...tree.root}>
	{@render treeItems(tree.children, 0)}
</ul>
