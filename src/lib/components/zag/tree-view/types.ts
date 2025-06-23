import * as tree from '@zag-js/tree-view';

export interface TreeViewProps<T extends TreeViewItem>
	extends Omit<tree.Props, 'id' | 'collection'> {
	value?: string[];
	items?: T[];
	label?: string;
	contextNode?: string | null;
}

export interface TreeViewItem {
	value: number;
	label: string;
	children?: TreeViewItem[];
}
