import type { CreateTreeViewProps, TreeView } from '@melt-ui/svelte';

export type Props = CreateTreeViewProps;
/* export type Props = Expand<
	OmitOpen<CreateTreeViewProps> & {
		open?: boolean;
		onOpenChange?: OnChangeFn<boolean>;
	}
>; */

export type GetReturn = TreeView & { class: string };

export type TreeItem = {
	id: number | string;
	title: string;
	children?: TreeItem[];
};
