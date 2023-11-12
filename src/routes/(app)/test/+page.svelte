<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { TreeView } from '$lib/components/treeview';
	import type { TreeItem } from '$lib/components/treeview';
	import { convertToTreeStructure } from '$lib/scripts/tree';
	import type { PageData } from './$types';

	export let data: PageData;
	let { categories } = data;
	$: ({ categories } = data);
	$: myTreeViewNodes = convertToTreeStructure(categories);

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

<div class="flex h-full items-center justify-center">
	<TreeView treeItems={myTreeViewNodes} on:select={(e) => rerunLoadFunction(e.detail)}></TreeView>
</div>
