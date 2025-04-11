<script lang="ts">
	import type { LayoutData } from './$types';
	import { arrayToTreeString } from '$lib/scripts/tree';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import DialogSelectReport from './DialogSelectReport.svelte';
	import type { Snippet } from 'svelte';
	// Icons
	import PhPrinter from '~icons/ph/printer';
	import ChevronsDownUp from '@lucide/svelte/icons/chevrons-down-up';
	import FolderPen from '@lucide/svelte/icons/folder-pen';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import { Tree } from '$lib/components/melt/tree';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	let treeData = $derived(arrayToTreeString(data.categories));

	let selectedId: string | undefined = $state(page.url.searchParams.get('cat') || undefined);
	const selected = page.url.searchParams.get('cat') ?? undefined;

	let showReportDialog = $state(false);

	let prevSelectedId: string | undefined = $state(undefined);
	$effect(() => {
		if (browser && selectedId && prevSelectedId !== selectedId) {
			prevSelectedId = selectedId;
			const newUrl = new URL(page.url);
			newUrl.searchParams.set('cat', selectedId);
			newUrl.searchParams.delete('search');

			goto(newUrl, { invalidate: ['catalog'] });
		}
	});
</script>

<main class="flex w-full flex-1 gap-2 overflow-hidden px-2 py-2">
	<Card.Root class="flex w-64 flex-col border-surface-2 bg-transparent">
		<Card.Header class="border-b p-3">
			<Card.Title>
				<div class="flex items-center gap-2">
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger id="edit_tooltip">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => {
										if (selectedId) {
											goto('/catalog/category/' + selectedId);
										}
									}}
									disabled={!selectedId}
								>
									<FolderPen strokeWidth={1.5} class="!size-6" />
									<span class="sr-only">Edit</span>
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom">Edit</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger id="create_tooltip">
								<Button variant="ghost" size="icon">
									<FolderPlus strokeWidth={1.5} class="!size-6" />
									<span class="sr-only">Create Category</span>
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom">Create Category</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>

					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger id="collaps_tooltip">
								<Button variant="ghost" size="icon">
									<ChevronsDownUp strokeWidth={1.5} class="!size-6" />
									<span class="sr-only">Collaps Tree</span>
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom">Collaps Tree</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger id="report_tooltip">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => (showReportDialog = !showReportDialog)}
								>
									<span class="sr-only">Generate Report</span>
									<PhPrinter class="!size-6" />
									<!-- <PhPrinter size="24" /> -->
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom">Generate Report</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			</Card.Title>
		</Card.Header>
		<Card.Content class="flex-1 overflow-auto p-1">
			<!-- <TreeView {treeItems} expanded={data.expanded} bind:selected /> -->
			<Tree
				items={treeData}
				{selected}
				onSelectedChange={(v) => {
					selectedId = v;
				}}
			/>
		</Card.Content>
	</Card.Root>

	{@render children?.()}
</main>

<DialogSelectReport
	bind:showReportDialog
	warehouses={data.warehouses}
	activeCategory={selectedId}
/>
