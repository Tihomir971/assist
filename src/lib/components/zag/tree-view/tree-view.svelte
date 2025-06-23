<script lang="ts" generics="T extends TreeViewItem">
	import type { TreeViewItem, TreeViewProps } from './types';
	import './tree-view.css';
	import { Button } from '$lib/components/ui/button/index.js';

	import * as tree from '@zag-js/tree-view';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import PhCaretRight from '~icons/ph/caret-right';
	import { page } from '$app/state';
	import { goto, invalidate } from '$app/navigation';
	import { untrack } from 'svelte';

	let internalChange = $state(false);
	console.log('recreate tree');

	interface TreeNodeProps {
		node: TreeViewItem; // Changed Node to TreeViewItem
		indexPath: number[];
		api: tree.Api;
	}
	let {
		value = [],
		items = [],
		onSelectionChange,
		label,
		contextNode = $bindable(),
		selectedValue = $bindable([]),

		onExpandedChange,
		...restProps
	}: TreeViewProps<T> = $props();
	const collection = $derived(
		tree.collection<TreeViewItem>({
			nodeToValue: (node) => node.value.toString(),
			nodeToString: (node) => node.label,
			rootNode: {
				value: 0,
				label: '',
				children: items
			}
		})
	);

	const getParentValues = (targetValues: string[]): string[] => {
		if (!targetValues?.length) return [];
		const allParentValues = new Set<string>();
		for (const targetValue of targetValues) {
			const parentNodes = collection.getParentNodes(targetValue);
			if (parentNodes) {
				parentNodes.forEach((node) => allParentValues.add(node.value.toString()));
			}
		}
		return Array.from(allParentValues);
	};

	const initialExpandedValue = $derived(getParentValues(selectedValue || []));
	const id = $props.id();
	const service = useMachine(tree.machine, {
		id,
		get collection() {
			return collection;
		},
		get selectedValue() {
			return selectedValue;
		},
		get defaultSelectedValue() {
			return value;
		},
		get defaultExpandedValue() {
			return initialExpandedValue;
		},

		onSelectionChange(details) {
			internalChange = true;
			onSelectionChange?.(details);
		},
		onExpandedChange(details) {
			onExpandedChange?.(details);
		},
		...restProps
	});

	const api = $derived(tree.connect(service, normalizeProps));
	$effect(() => {
		// 'value' is tracked - will trigger the effect
		const currentValue = value;

		untrack(() => {
			if (internalChange) {
				internalChange = false;
			} else {
				api.setSelectedValue(currentValue); // using the tracked value
				api.setExpandedValue(initialExpandedValue); // untracked
				invalidate('catalog:products');
			}
		});
	});
	$inspect('value', value);
	$inspect('internalChange', internalChange);
	$inspect('api.selectedValue', api.selectedValue);
	$inspect('api.expandedValue', api.expandedValue);
</script>

{#snippet treeNode(nodeProps: TreeNodeProps)}
	{@const { node, indexPath, api } = nodeProps}
	{@const nodeState = api.getNodeState({ indexPath, node })}

	{#if nodeState.isBranch}
		<div {...api.getBranchProps({ indexPath, node })}>
			<div {...api.getBranchControlProps({ indexPath, node })}>
				<!-- <PhFolder /> -->
				<span {...api.getBranchIndicatorProps({ indexPath, node })}>
					<PhCaretRight />
				</span>
				<span {...api.getBranchTextProps({ indexPath, node })} class="truncate text-sm"
					>{node.label}</span
				>
			</div>
			<div {...api.getBranchContentProps({ indexPath, node })}>
				<!-- <div {...api.getBranchIndentGuideProps({ indexPath, node })}></div> -->
				{#each node.children || [] as childNode, index}
					{@render treeNode({ node: childNode, indexPath: [...indexPath, index], api })}
				{/each}
			</div>
		</div>
	{:else}
		<div {...api.getItemProps({ indexPath, node })}>
			<!-- <PhFile /> -->
			<span class="ml-6 truncate text-sm">
				{node.label}
			</span>
		</div>
	{/if}
{/snippet}

<div
	{...api.getRootProps()}
	class="flex h-full flex-col"
	oncontextmenu={(event) => {
		event.preventDefault();
		const target = event.target as HTMLElement;
		const targetNode = target.closest('[data-part="item"], [data-part="branch"]');
		if (targetNode) {
			const nodeId = targetNode.getAttribute('data-value');
			contextNode = nodeId;
		}
	}}
>
	{#if label}
		<h3 {...api.getLabelProps()}>{label}</h3>
	{/if}
	<div class="bg-surface-1 flex flex-row-reverse gap-2 p-3">
		<Button
			variant="outline"
			onclick={() => {
				api.collapse();
				const path = page.url.searchParams;
				path.delete('cat');
				console.log(`/catalog?${path.toString()}`);

				goto(`/catalog?${path.toString()}`, {
					invalidate: ['catalog:products']
				});
			}}
		>
			Collapse All
		</Button>
		<!-- <Button variant="outline" onclick={() => api.expand()}>Expand All</Button> -->
	</div>
	<div class="flex-1 overflow-x-hidden overflow-y-auto">
		<div {...api.getTreeProps()}>
			{#each items as item, index}
				{@render treeNode({ node: item as TreeViewItem, indexPath: [index], api })}
			{/each}
		</div>
	</div>
</div>
