<script lang="ts">
	import type { LayoutData } from './$types';
	import { convertToTreeStructure } from '$lib/scripts/tree';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { TreeView, type TreeItem } from '$lib/components/treeview';

	export let data: LayoutData;
	let { categories, defaultExpanded } = data;
	$: ({ categories, defaultExpanded } = data);
	$: myTreeViewNodes = convertToTreeStructure(categories);

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

<div class="flex h-[calc(100vh-4rem)] overflow-hidden">
	<div class="h-full w-80 bg-base-200">
		<TreeView
			treeItems={myTreeViewNodes}
			{defaultExpanded}
			on:select={(e) => rerunLoadFunction(e.detail)}
		></TreeView>
	</div>
	<div class="flex-grow overflow-hidden">
		<slot />
	</div>
</div>
