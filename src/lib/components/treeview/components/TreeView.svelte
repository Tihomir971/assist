<script lang="ts">
	import type { TreeItem, Props } from '..';
	import Tree from './tree.svelte';
	import { setCtx } from '../ctx';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { FolderEdit, FolderMinus, FolderPlus, FolderRoot } from 'lucide-svelte';
	//Comment
	export let treeItems: TreeItem[];
	export let forceVisible: Props['forceVisible'] = undefined;
	export let defaultExpanded: Props['defaultExpanded'] = [];
	//	export let expanded: Props['expanded'] = undefined;
	export let onExpandedChange: Props['onExpandedChange'] = undefined;

	const {
		elements: { tree },
		states: { selectedItem, expanded }
	} = setCtx({ forceVisible, defaultExpanded, onExpandedChange });

	function editCategory(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		const activeCategory = $page.url.searchParams.get('cat');
		if (activeCategory) goto('/catalog/category/' + activeCategory);
		return;
	}
</script>

<div class="h-full">
	<div class="join">
		<button class="btn btn-square join-item" type="button" on:click={editCategory}
			><FolderEdit strokeWidth={1.5} /></button
		>
		<button class="btn btn-square join-item" type="button"><FolderPlus strokeWidth={1.5} /></button>
		<button class="btn btn-square join-item" type="button"><FolderMinus strokeWidth={1.5} /></button
		>
		<button class="btn btn-square join-item" type="button" on:click={() => ($expanded = [])}
			><FolderRoot strokeWidth={1.5} /></button
		>
	</div>
	<div class="h-4"></div>
	<ul class="menu px-4 py-0" {...$tree}>
		<Tree {treeItems} on:select />
	</ul>
</div>
