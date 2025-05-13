import * as tree from '@zag-js/tree-view';

export interface TreeViewProps<T extends TreeViewItem>
	extends Omit<tree.Props, 'id' | 'collection' | 'value'> {
	/** Provide the list of label and value data */
	items?: T[];
	label?: string;
	inline?: boolean;
	value?: number | null;
	contextNode?: string | null;
}

export interface TreeViewItem {
	value: number;
	label: string;
	children?: TreeViewItem[];
}
