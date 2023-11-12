import type { CreateTreeViewProps, TreeView } from '@melt-ui/svelte';

export type Props = CreateTreeViewProps;
/* export type Props = Expand<
	OmitOpen<CreateTreeViewProps> & {
		open?: boolean;
		onOpenChange?: OnChangeFn<boolean>;
	}
>; */

export type GetReturn = TreeView;

type Icon = 'svelte' | 'folder' | 'js';
export type TreeItem = {
	id: number | string;
	title: string;
	icon?: Icon;
	children?: TreeItem[];
};
