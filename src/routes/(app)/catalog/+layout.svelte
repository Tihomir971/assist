<script lang="ts">
	import { RecursiveTreeView, type TreeViewNode } from '@skeletonlabs/skeleton';

	import type { LayoutData } from './$types';
	import { convertToTreeStructure } from '$lib/scripts/tree';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let data: LayoutData;
	let { categories } = data;
	$: ({ categories } = data);

	let myTreeViewNodes: TreeViewNode[] = [
		{
			id: 'unique-id',
			content: 'content',
			lead: '(icon)',
			children: [{ id: 'unique-id-2', content: 'content', lead: '(icon)' }]
		}
	];
	let checkedNodes: string[] = [];
	let indeterminateNodes: string[] = [];
	$: myTreeViewNodes = convertToTreeStructure(categories);

	$: checkedNodes, rerunLoadFunction();

	function rerunLoadFunction() {
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
	}
</script>

<div class="grid grid-cols-[auto_1fr] h-full">
	<div class="w-96 h-full overflow-auto">
		<RecursiveTreeView
			padding="py-1 px-4"
			selection
			multiple
			relational
			nodes={myTreeViewNodes}
			bind:checkedNodes
			bind:indeterminateNodes
		/>
	</div>
	<slot />
</div>
