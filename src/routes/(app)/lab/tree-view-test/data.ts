import type { TreeViewItem } from '$lib/components/zag/tree-view/types';

export const data: TreeViewItem[] = [
	{
		value: 1,
		label: 'Node 1',
		children: [
			{ value: 11, label: 'Node 1.1' },
			{ value: 12, label: 'Node 1.2' }
		]
	},
	{
		value: 2,
		label: 'Node 2',
		children: [
			{ value: 21, label: 'Node 2.1' },
			{
				value: 22,
				label: 'Node 2.2',
				children: [
					{ value: 221, label: 'Node 2.2.1' },
					{ value: 222, label: 'Node 2.2.2' }
				]
			}
		]
	},
	{ value: 3, label: 'Node 3' }
];
