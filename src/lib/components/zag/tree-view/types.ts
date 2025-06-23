import * as tree from '@zag-js/tree-view';

export interface TreeViewProps<T extends TreeViewItem>
	extends Omit<tree.Props, 'id' | 'collection'> {
	/** Provide the list of label and value data */
	value?: string[];
	items?: T[];
	label?: string;
	/** Context menu node */
	contextNode?: string | null;
}

export interface TreeViewItem {
	value: number;
	label: string;
	children?: TreeViewItem[];
}
