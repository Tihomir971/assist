import type { TreeViewRootBaseProps } from '@ark-ui/svelte/tree-view';
import type { Component } from 'svelte';

export interface TreeViewNode<T = number | string> {
	id: T;
	name: string;
	children?: TreeViewNode<T>[] | undefined;
	// Optional metadata for enhanced functionality
	icon?: string;
	disabled?: boolean;
	metadata?: Record<string, unknown>;
}

export interface TreeViewProps
	extends Omit<TreeViewRootBaseProps<TreeViewNode<string | number>>, 'collection'> {
	/** Tree data structure */
	items: TreeViewNode<string | number>[];
	/** Optional label for the tree */
	label?: string;
	/** Custom icons for different node types */
	icons?: Partial<TreeViewIcons>;
}

export interface TreeViewIcons {
	chevronRight: Component;
	chevronDown: Component;
	folderClosed: Component;
	folderOpen: Component;
	file: Component;
}
