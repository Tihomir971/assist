<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';

	import type { LayoutData } from './$types';
	import { convertToTreeStructure } from '$lib/scripts/tree';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { TreeView } from '$lib/components/treeview';
	import { Toolbar } from '$lib/components/toolbar';
	import PhNotePencil from '$lib/icons/PhNotePencil.svelte';
	import PhFolderPlus from '$lib/icons/PhFolderPlus.svelte';
	import PhFolderMinus from '$lib/icons/PhFolderMinus.svelte';
	import PhArrowsInLineVertical from '$lib/icons/PhArrowsInLineVertical.svelte';
	import { Button } from '$lib/components/ui/button';

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
			goto(`${newUrl.origin}${newUrl.pathname}${newUrl.search}`);
		}
		return;
	}
	let selected: HTMLElement | null | undefined;
	//	let expanded: string[] | undefined = undefined;

	function editCategory() {
		console.log('editCategory');

		//	const activeCategory = $page.url.searchParams.get('cat');
		if (selected) goto('/catalog/category/' + selected.getAttribute('data-id'));
		return;
	}
	$: if (selected) {
		rerunLoadFunction(selected.getAttribute('data-id'));
	}
</script>

<div class="flex h-full">
	<div class="flex h-full w-80 flex-col overflow-hidden">
		<div class="flex p-1">
			<Button variant="outline" size="icon" on:click={editCategory}>
				<PhNotePencil class="w-6" />
			</Button>
			<Button variant="outline" size="icon">
				<PhFolderPlus class="w-6"></PhFolderPlus>
			</Button>
			<Button variant="outline" size="icon">
				<PhFolderMinus class="w-6" />
			</Button>
			<Button variant="outline" size="icon">
				<PhArrowsInLineVertical class="w-6" />
			</Button>
			<Button variant="outline" size="icon">
				<PhNotePencil class="w-6" />
			</Button>
		</div>
		<Toolbar.Root class="join border-b">
			<Toolbar.Button
				type="button"
				data-tip="Edit"
				on:click={editCategory}
				class="join-item tooltip tooltip-bottom"
			>
				<PhNotePencil class="w-6" />
			</Toolbar.Button>
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

	<div class="grid w-full grid-rows-[auto_1fr] p-2">
		<slot />
	</div>
</div>
