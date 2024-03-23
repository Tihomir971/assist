<script lang="ts">
	import type { LayoutData } from './$types';
	import { convertToTreeStructure } from '$lib/scripts/tree';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { TreeView, type TreeItem } from '$lib/components/treeview';
	import { Toolbar } from '$lib/components/toolbar';
	import PhNotePencil from '$lib/icons/PhNotePencil.svelte';
	import PhFolderPlus from '$lib/icons/PhFolderPlus.svelte';

	export let data: LayoutData;
	let { categories, expanded } = data;
	$: ({ categories } = data);

	$: treeItems = convertToTreeStructure(categories);

	function rerunLoadFunction(id: string | null) {
		if (!id) return;
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
	let selected: HTMLElement | null | undefined;
	//	let expanded: string[] | undefined = undefined;

	function editCategory() {
		//	const activeCategory = $page.url.searchParams.get('cat');
		if (selected) goto('/catalog/category/' + selected.getAttribute('data-id'));
		return;
	}
	$: if (selected) {
		rerunLoadFunction(selected.getAttribute('data-id'));
	}
</script>

<div class="flex h-full">
	<div class="flex h-full w-80 flex-col overflow-hidden bg-base-200">
		<Toolbar.Root class="join border-b">
			<Toolbar.Button
				type="button"
				data-tip="Edit"
				on:click={editCategory}
				class="btn join-item tooltip tooltip-bottom"
			>
				<PhNotePencil class="w-6" />
				<!-- <iconify-icon icon="ph:note-pencil" width="24" height="24"
				></iconify-icon> --></Toolbar.Button
			>
			<Toolbar.Button type="button" data-tip="Add" class="btn join-item tooltip tooltip-bottom">
				<PhFolderPlus class="w-6"></PhFolderPlus>
				<!-- <iconify-icon icon="ph:folder-plus" width="24" height="24"></iconify-icon> -->
			</Toolbar.Button>
			<Toolbar.Button type="button" data-tip="Delete" class="btn join-item tooltip tooltip-bottom">
				<iconify-icon icon="ph:folder-minus" width="24" height="24"></iconify-icon>
			</Toolbar.Button>
			<Toolbar.Button
				type="button"
				data-tip="Collapse"
				class="btn join-item tooltip tooltip-bottom"
				on:click={() => (expanded = [])}
			>
				<iconify-icon icon="ph:arrows-in-line-vertical" width="24" height="24"></iconify-icon>
			</Toolbar.Button>
		</Toolbar.Root>
		<div class="h-full w-full overflow-y-auto">
			<TreeView bind:treeItems bind:selected bind:expanded />
		</div>
	</div>
	<div class="flex-grow overflow-hidden">
		<slot />
	</div>
</div>
