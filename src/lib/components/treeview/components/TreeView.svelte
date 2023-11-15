<script lang="ts">
	import type { TreeItem, Props } from '..';
	import Tree from './tree.svelte';
	import { setCtx } from '../ctx';
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
</script>

<div class="flex flex-col bg-surface-54 text-text-1 h-full">
	<div class="flex flex-col gap-1 px-4 pt-4">
		<h3 class="text-lg font-medium">Categories</h3>
		<hr />
	</div>

	<ul class="overflow-auto px-4 pb-4 pt-2 w-full flex-grow" {...$tree}>
		<Tree {treeItems} on:select />
	</ul>
</div>
