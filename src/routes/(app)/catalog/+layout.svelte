<script lang="ts">
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
			goto(`${newUrl.origin}/catalog${newUrl.search}`);
		}
		return;
	}
</script>

<div class="app-layout-area--sub-nav flex h-[calc(100vh-3rem)] overflow-hidden">
	<div class="h-full w-80">
		<TreeView treeItems={myTreeViewNodes} on:select={(e) => rerunLoadFunction(e.detail)}></TreeView>
	</div>
	<div class="flex-grow overflow-hidden">
		<slot />
	</div>
</div>

<style lang="postcss">
	.app-layout-area--sub-nav {
		grid-area: sub-nav;
	}
</style>
