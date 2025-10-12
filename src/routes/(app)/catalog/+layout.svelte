<script lang="ts">
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as ContextMenu from '$lib/components/zag/index.js';

	import DialogSelectReport from './DialogSelectReport.svelte';
	import type { Snippet } from 'svelte';
	// Icons
	import { TreeViewZag } from '$lib/components/zag';
	import { categoryCache } from '$lib/stores/category-cache.svelte';
	import type { TreeStructure } from '$lib/services/supabase/category.service';

	let contextNode: string | null = $state(null);
	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	let showReportDialog = $state(false);
	// Use a plain reactive state for treeData; server may no longer provide categories
	let treeData = $state<TreeStructure[]>([]);

	// Load categories from cache
	onMount(async () => {
		if (!categoryCache) return;

		try {
			treeData = await categoryCache.getCategories(data.app?.userLocale);
		} catch (err) {
			console.warn('Failed to load categories from cache:', err);
		}
	});

	const initCategory = $derived(page.url.searchParams.get('cat'));
	let selectedValue = $derived(initCategory ? [initCategory] : []);

	const selectedCategory = $derived(selectedValue?.[0] ? parseInt(selectedValue[0]) : undefined);
</script>

<main class="flex w-full flex-1 gap-2 overflow-y-auto px-2 py-2">
	<Card.Root class="flex h-full w-64 flex-col gap-0 p-0">
		<Card.Content class="h-full min-h-0 flex-1 p-0">
			<ContextMenu.Root
				onSelect={({ value }) => {
					switch (value) {
						case 'edit':
							if (!contextNode) return;
							goto(`/catalog/category/edit/${contextNode}?${page.url.searchParams}`);
							break;
						case 'add':
							goto('/catalog/category/edit');
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
						bind:selectedValue
						onSelectionChange={(details) => {
							if (!details.focusedValue) return;
							const newUrl = new URL(page.url);
							newUrl.searchParams.set('cat', details.focusedValue);
							newUrl.searchParams.delete('search');
							goto(newUrl, {
								invalidate: ['catalog:products'],
								noScroll: true,
								replaceState: false
							});
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
