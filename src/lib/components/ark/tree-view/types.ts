import type { TreeViewRootBaseProps } from '@ark-ui/svelte/tree-view';

export interface TreeViewNode<T = number | string> {
	id: T;
	name: string;
	children?: TreeViewNode[] | undefined;
}
export interface SelectItem<T = number | string> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface TreeViewProps<T extends TreeViewNode>
	extends Omit<TreeViewRootBaseProps<TreeViewNode>, 'value' | 'readOnly' | 'collection'> {
	value?: number | string | null;
	readonly?: boolean;
	items: T[];
	label?: string;
	placeholder?: string;
}
