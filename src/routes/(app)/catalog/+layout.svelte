<script lang="ts">
	import { RecursiveTreeView, type TreeViewNode } from '@skeletonlabs/skeleton';

	import type { LayoutData } from './$types';
	import { convertToTreeStructure } from '$lib/scripts/tree';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { TreeView, type TreeItem } from '$lib/components/treeview';

	export let data: LayoutData;
	let { categories } = data;
	$: ({ categories } = data);
	$: myTreeViewNodes = convertToTreeStructure(categories);

	//let myTreeViewNodes: TreeItem[];
	let checkedNodes: string[] = [];
	//	let indeterminateNodes: string[] = [];

	//	$: checkedNodes, rerunLoadFunction();

	/* 	function rerunLoadFunction() {
		const newUrl = new URL($page.url);
		if (checkedNodes.length > 0) {
			newUrl?.searchParams?.set('cat', checkedNodes.toString());
		} else {
			newUrl?.searchParams?.delete('cat');
		}
		if (browser) {
			goto(newUrl);
		}
		return;
	} */
	function rerunLoadFunction(id: string) {
		const newUrl = new URL($page.url);
		if (id) {
			newUrl?.searchParams?.set('cat', id);
		} else {
			newUrl?.searchParams?.delete('cat');
		}
		if (browser) {
			goto(newUrl);
		}
		return;
	}
</script>

<!-- <div class="grid grid-cols-[auto_1fr] h-full">
	<div class="w-96 h-full overflow-auto">
		 	<RecursiveTreeView
			padding="py-1 px-4"
			selection
			multiple
			relational
			nodes={myTreeViewNodes}
			bind:checkedNodes
			class="overflow-auto"
		/> 
	</div>
	<slot />
</div> -->
<div class="flex overflow-hidden h-[calc(100vh-3rem)]">
	<div class="w-80 h-full">
		<TreeView treeItems={myTreeViewNodes} on:select={(e) => rerunLoadFunction(e.detail)}></TreeView>
	</div>
	<div class="flex-grow overflow-hidden">
		<slot />
	</div>
</div>
