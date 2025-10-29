import * as tree from '@zag-js/tree-view';

export interface TreeViewProps<T extends TreeViewItem>
	extends Omit<tree.Props, 'id' | 'collection' | 'checkedValue'> {
	value?: string[] | string[];
	items?: T[];
	label?: string;
	contextNode?: string | null;
	checkedValue?: number[];
}

export interface TreeViewItem {
	value: number;
	label: string;
	children?: TreeViewItem[];
}
