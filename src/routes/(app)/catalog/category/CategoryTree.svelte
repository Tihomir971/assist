<script lang="ts">
	import { Toolbar } from '$lib/components/toolbar';
	import { TreeView, type TreeItem } from '$lib/components/treeview';
	import PhFolderPlus from '$lib/icons/PhFolderPlus.svelte';
	import PhNotePencil from '$lib/icons/PhNotePencil.svelte';
	export let expanded: string[] | undefined;
	export let selected: HTMLElement | null | undefined;
	export let treeItems: TreeItem[];
</script>

<div class="flex h-full w-80 flex-col overflow-hidden bg-base-200">
	<Toolbar.Root class="join border-b">
		<Toolbar.Button type="button" data-tip="Edit" class="btn join-item tooltip tooltip-bottom">
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
