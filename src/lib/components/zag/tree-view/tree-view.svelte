<script lang="ts" generics="T extends TreeViewItem">
	import type { TreeViewItem, TreeViewProps } from './types';
	import './tree-view.css';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as tree from '@zag-js/tree-view';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import PhCaretRight from '~icons/ph/caret-right';
	import { page } from '$app/state';
	import { goto, invalidate } from '$app/navigation';
	import { untrack } from 'svelte';
	import PhArrowsInSimple from '~icons/ph/arrows-in-simple';
	import PhX from '~icons/ph/x';
	import { debounce } from '$lib/scripts/debounce';

	let searchTerm = $state('');
	let debouncedSearchTerm = $state('');

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
		selectedValue = $bindable(),
		checkedValue = $bindable(),
		selectionMode = 'single',
		onExpandedChange,
		onCheckedChange,
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

	const filteredCollection = $derived(
		collection.filter((node) => {
			if (!debouncedSearchTerm) return true;
			return node.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
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
		selectionMode,
		get collection() {
			return filteredCollection;
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
		defaultCheckedValue: checkedValue?.map(String),
		onSelectionChange(details) {
			onSelectionChange?.(details);
		},
		onCheckedChange(details) {
			checkedValue = details.checkedValue?.map(Number);
			onCheckedChange?.(details);
		},
		onExpandedChange(details) {
			onExpandedChange?.(details);
		},
		...restProps
	});

	const api = $derived(tree.connect(service, normalizeProps));

	const debouncedUpdate = debounce((value: string) => {
		debouncedSearchTerm = value;
	}, 300);

	$effect(() => {
		debouncedUpdate(searchTerm);
	});

	$effect(() => {
		const currentValue = debouncedSearchTerm;

		untrack(() => {
			if (currentValue) {
				const allNodeValues = filteredCollection.toJSON();
				api.setExpandedValue(allNodeValues);
			} else {
				api.setExpandedValue(initialExpandedValue);
			}
		});
	});

	$effect(() => {
		const requiredParents = initialExpandedValue;

		untrack(() => {
			// We only apply this programmatic expansion if there is no active search.
			// The search logic has its own separate effect for expanding all nodes.
			if (!debouncedSearchTerm) {
				const currentlyExpanded = api.expandedValue;
				const mergedExpandedState = new Set([...currentlyExpanded, ...requiredParents]);
				api.setExpandedValue(Array.from(mergedExpandedState));
			}
		});
	});
</script>

{#snippet treeNode(nodeProps: TreeNodeProps)}
	{@const { node, indexPath, api } = nodeProps}
	{@const nodeState = api.getNodeState({ indexPath, node })}

	{#if nodeState.isBranch}
		<div {...api.getBranchProps({ indexPath, node })}>
			<div {...api.getBranchControlProps({ indexPath, node })}>
				{#if selectionMode === 'multiple'}
					{#key node.value}
						{@const checkboxProps = api.getNodeCheckboxProps({ indexPath, node })}
						<input
							type="checkbox"
							{...checkboxProps}
							checked={checkboxProps['data-state'] === 'checked'}
							indeterminate={checkboxProps['data-state'] === 'indeterminate'}
						/>
					{/key}
				{/if}
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
			{#if selectionMode === 'multiple'}
				{#key node.value}
					{@const checkboxProps = api.getNodeCheckboxProps({ indexPath, node })}
					<input
						type="checkbox"
						{...checkboxProps}
						checked={checkboxProps['data-state'] === 'checked'}
						indeterminate={checkboxProps['data-state'] === 'indeterminate'}
					/>
				{/key}
			{/if}
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
	<div class="flex gap-2 p-3">
		<Button
			variant="outline"
			size="icon"
			onclick={() => {
				api.collapse();
				const path = page.url.searchParams;
				path.delete('cat');
				goto(`/catalog?${path.toString()}`, {
					invalidate: ['catalog:products']
				});
			}}
		>
			<PhArrowsInSimple />
		</Button>
		<div class="relative flex-1">
			<Input placeholder="Search..." bind:value={searchTerm} class="pr-8" />
			{#if searchTerm}
				<Button
					variant="ghost"
					size="icon"
					class="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
					onclick={() => {
						searchTerm = '';
					}}
				>
					<PhX class="h-4 w-4" />
				</Button>
			{/if}
		</div>
	</div>
	<div class="flex-1 overflow-x-hidden overflow-y-auto">
		<div {...api.getTreeProps()}>
			{#each filteredCollection.rootNode.children || [] as item, index}
				{@render treeNode({ node: item as TreeViewItem, indexPath: [index], api })}
			{/each}
		</div>
	</div>
</div>
