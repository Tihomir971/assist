<script lang="ts">
	import * as treeView from '@zag-js/tree-view';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import { type TreeNode } from '@zag-js/tree-view';
	import { data } from './data';

	const treeCollection = treeView.collection({
		rootNode: { children: data }
	});

	const service = useMachine(treeView.machine, {
		collection: treeCollection,
		id: '1',
		selectionMode: 'multiple'
	});

	const api = $derived(treeView.connect(service, normalizeProps));

	type TreeNodeProps = {
		node: TreeNode;
		indexPath: number[];
	};
</script>

{#snippet treeNode(props: TreeNodeProps)}
	{@const { node, indexPath } = props}
	{@const nodeState = api.getNodeState({ indexPath, node })}

	{#if nodeState.isBranch}
		<li {...api.getBranchProps({ indexPath, node })}>
			<div {...api.getBranchControlProps({ indexPath, node })}>
				<span {...api.getBranchIndicatorProps({ indexPath, node })}>
					{#if nodeState.expanded}&#9660;{:else}&#9654;{/if}
				</span>
				<input type="checkbox" {...api.getItemCheckboxProps({ indexPath, node })} />
				<span {...api.getBranchTextProps({ indexPath, node })}>{node.name}</span>
			</div>
			{#if nodeState.expanded}
				<ul {...api.getBranchContentProps({ indexPath, node })}>
					{#each node.children || [] as childNode, index}
						{@render treeNode({ node: childNode, indexPath: [...indexPath, index] })}
					{/each}
				</ul>
			{/if}
		</li>
	{:else}
		<li {...api.getItemProps({ indexPath, node })}>
			<input type="checkbox" {...api.getItemCheckboxProps({ indexPath, node })} />
			<span {...api.getItemTextProps({ indexPath, node })}>{node.name}</span>
		</li>
	{/if}
{/snippet}

<div {...api.getRootProps()}>
	<h3 {...api.getLabelProps()}>Svelte TreeView</h3>
	<ul {...api.getTreeProps()}>
		{#each treeCollection.rootNode.children as node, index}
			{@render treeNode({ node, indexPath: [index] })}
		{/each}
	</ul>
</div>

<style>
	[data-part='branch-control'],
	[data-part='item'] {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px;
	}
	[data-part='branch-indicator'] {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	[data-part='branch-content'] {
		padding-left: 20px;
	}
	ul {
		list-style-type: none;
		padding-left: 20px;
	}
</style>
