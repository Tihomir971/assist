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

<div class="flex h-full flex-col">
	<div class="join w-full border-b-2 border-base-100">
		<button
			class="btn join-item tooltip tooltip-bottom"
			data-tip="Edit"
			type="button"
			on:click={editCategory}><FolderEdit strokeWidth={1.5} /></button
		>
		<button class="btn join-item tooltip tooltip-bottom" data-tip="Add" type="button">
			<FolderPlus strokeWidth={1.5} />
		</button>
		<button class="btn join-item tooltip tooltip-bottom" data-tip="Delete" type="button">
			<FolderMinus strokeWidth={1.5} />
		</button>
		<button
			class="btn join-item tooltip tooltip-bottom"
			data-tip="Collapse"
			type="button"
			on:click={() => ($expanded = [])}
		>
			<FolderRoot strokeWidth={1.5} />
		</button>
	</div>

	<div class="h-full overflow-y-auto">
		<ul class="menu py-0" {...$tree}>
			<Tree {treeItems} on:select />
		</ul>
	</div>
</div>
