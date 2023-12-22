<script lang="ts">
	import type { TreeItem, Props } from '..';
	import Tree from './tree.svelte';
	import { setCtx } from '../ctx';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { FolderEdit } from 'lucide-svelte';
	//Comment
	export let treeItems: TreeItem[];
	export let forceVisible: Props['forceVisible'] = undefined;
	export let defaultExpanded: Props['defaultExpanded'] = [];
	export let expanded: Props['expanded'] = undefined;
	export let onExpandedChange: Props['onExpandedChange'] = undefined;

	const {
		elements: { tree },
		states: { selectedItem }
	} = setCtx({ forceVisible, defaultExpanded, expanded, onExpandedChange });

	function editCategory(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		const activeCategory = $page.url.searchParams.get('cat');
		if (activeCategory) goto('/catalog/category/' + activeCategory);
		return;
	}
</script>

<div class="flex h-full flex-col bg-surface-2 text-text-1">
	<div class="flex gap-2 p-2 *:size-8 *:p-0">
		<button type="button" on:click={editCategory}><FolderEdit strokeWidth={1.5} /></button>
		<button type="button">-</button>
		<button type="button">+</button>
		<button type="button">+</button>
		<button type="button">+</button>
	</div>

	<ul class="w-full flex-grow !list-none overflow-auto pb-4 pt-2" {...$tree}>
		<Tree {treeItems} on:select />
	</ul>
</div>
