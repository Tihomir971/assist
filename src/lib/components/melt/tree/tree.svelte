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
	import { Button } from '$lib/components/ui/button/index.js';
	import { back } from '@melt-ui/svelte/internal/helpers';

	type Item = TreeItem<{
		title: string;
	}>;
	const data: Item[] = [
		{
			id: '1',
			title: 'Root 1'
		},
		{
			id: '2',
			title: 'Root 2',
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
			title: 'Root 3',
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
	];
	const testTree = [
		{
			id: 1,
			title: 'Root 1'
		},
		{
			id: 2,
			title: 'Root 2',
			children: [
				{
					id: 3,
					title: 'Child Root 2',
					children: [
						{
							id: 4,
							title: 'Tree.svelte'
						},
						{
							id: 5,
							title: 'TreeItem.svelte'
						}
					]
				}
			]
		}
	];
	type TestTree = typeof testTree;

	const tree = new Tree({
		items: data,
		expanded: ['lib', 'routes'],
		expandOnClick: true
	});
</script>

{#snippet treeItemIcon(item: (typeof tree)['children'][number])}
	<!-- {@const icon = item.item.icon} -->

	{#if item.children?.length}
		<svelte:component this={item.expanded ? PhCaretDown : PhCaretRight} role="presentation" />
		<!-- {:else if icon === 'svelte'}
		<Svelte role="presentation" /> -->
	{:else}
		<div class="size-5"></div>
	{/if}
	<svelte:component this={item.selected ? PhFolderFill : PhFolder} role="presentation" />
	<!-- {#if item.selected} -->
	<!-- {:else if icon === 'svelte'}
		<Svelte role="presentation" /> -->
	<!-- {:else} -->
	<!-- <JavaScript role="presentation" /> -->
	<!-- {/if} -->
{/snippet}

{#snippet treeItems(items: (typeof tree)['children'], depth: number = 0)}
	{#each items as item (item.id)}
		<li
			{...item.attrs}
			class="cursor-pointer rounded-sm outline-none first:mt-0 [&:focus-visible>:first-child>div]:ring-4"
		>
			<div class="group py-1" style="padding-left: {depth * 1}rem">
				<div
					class="{item.selected
						? 'text-secondary-foreground bg-surface-document'
						: ''} {item.expanded ? 'h-auto' : 'h-0'}
					ring-accent-500 dark:ring-accent-700 group-hover:bg-surface-2 flex h-full w-full items-center gap-0.5
					rounded-xl px-3 py-1 ring-offset-white transition
					dark:ring-offset-black"
				>
					{@render treeItemIcon(item)}
					<span class="select-none">
						{item.item.title}
					</span>
				</div>
			</div>
			{#if item.children?.length && item.expanded}
				<div
					{...tree.group}
					class="relative list-none p-0 {!item.expanded ? 'pointer-events-none' : ''} origin-left"
				>
					<div
						class="absolute top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700"
						style="left: {0.5 + depth * 1}rem"
					></div>
					{@render treeItems(item.children, depth + 1)}
				</div>
			{/if}
		</li>
	{/each}
{/snippet}
{tree.selected}
<ul class="mx-auto w-[300px] list-none rounded-md p-4" {...tree.root}>
	{@render treeItems(tree.children, 0)}
</ul>
