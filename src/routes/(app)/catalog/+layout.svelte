<script lang="ts">
	import type { LayoutData } from './$types';
	import { arrayToTree } from '$lib/scripts/tree';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as ContextMenu from '$lib/components/zag/context-menu/index';

	import DialogSelectReport from './DialogSelectReport.svelte';
	import type { Snippet } from 'svelte';
	// Icons
	import { TreeViewZag } from '$lib/components/zag';
	let contextNode: string | null = $state(null);
	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	let showReportDialog = $state(false);
	let treeData = $derived(arrayToTree(data.categories));

	const initCategory = page.url.searchParams.get('cat');
	let selectedCategory = $state(initCategory ? parseInt(initCategory) : undefined);
</script>

<main class="flex w-full flex-1 gap-2 overflow-hidden px-2 py-2">
	<Card.Root class="flex h-full w-64 flex-col border-surface-2 bg-transparent">
		<Card.Content class="h-full min-h-0 flex-1 p-0">
			<ContextMenu.Root
				onSelect={({ value }) => {
					switch (value) {
						case 'edit':
							if (!contextNode) return;
							console.log('Edit action called for node ID:', contextNode);
							goto(`/catalog/category/${contextNode}?${page.url.searchParams}`);
							break;
						case 'add':
							goto('/catalog/category');
							break;
						case 'delete':
							// handleDelete(contextmenu);
							break;
						case 'report':
							showReportDialog = !showReportDialog;
							break;
						default:
							console.warn('Unknown context menu action:', value);
					}
					contextNode = null;
				}}
			>
				<ContextMenu.Trigger class="h-full">
					<TreeViewZag
						items={treeData}
						bind:contextNode
						defaultSelectedValue={selectedCategory ? [selectedCategory.toString()] : undefined}
						onSelectionChange={({ focusedValue }) => {
							if (!focusedValue) return;
							selectedCategory = parseInt(focusedValue);
							const newUrl = new URL(page.url);
							newUrl.searchParams.set('cat', focusedValue);
							newUrl.searchParams.delete('search');
							goto(newUrl, { invalidate: ['catalog:products'] });
						}}
					/>
				</ContextMenu.Trigger>
				<ContextMenu.Content>
					<ContextMenu.Item value="add">Add new category</ContextMenu.Item>
					<ContextMenu.Separator />
					<ContextMenu.Item value="edit">Edit</ContextMenu.Item>
					<ContextMenu.Item value="delete" disabled>Delete (Disabled)</ContextMenu.Item>
					<ContextMenu.Item value="report">Generate Report...</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Root>
		</Card.Content>
	</Card.Root>

	{@render children?.()}
</main>

<DialogSelectReport
	bind:showReportDialog
	warehouses={data.warehouses}
	activeCategory={selectedCategory?.toString()}
/>
