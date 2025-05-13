import type { MaybeGetter } from 'melt';
import type { TreeItem } from 'melt/builders';

type CustomTreeItem = TreeItem & {
	title: string;
	children?: CustomTreeItem[];
};

interface TableTreeItem {
	value: number;
	label: string;
	parent_id: number | null;
}
interface Output {
	value: number;
	label: string;
	children?: Output[];
}

export function arrayToTree(items: TableTreeItem[] | null | undefined): Output[] {
	if (!items) return [];
	const itemMap = new Map<number, Output>();

	// Initialize the map with items, preparing the basic structure
	items.forEach((item) => {
		// Create Output object, ensuring children array is initialized
		itemMap.set(item.value, { value: item.value, label: item.label, children: [] });
	});

	const result: Output[] = [];
	items.forEach((item) => {
		const currentItem = itemMap.get(item.value)!; // Non-null assertion is safe due to initialization loop
		if (item.parent_id === null) {
			// Root item
			result.push(currentItem);
		} else {
			const parent = itemMap.get(item.parent_id);
			if (parent) {
				// Parent found, add current item to parent's children
				// Children array is guaranteed to exist from initialization
				parent.children!.push(currentItem);
			}
		}
	});

	// Clean up: remove empty children arrays
	itemMap.forEach((item) => {
		if (item.children && item.children.length === 0) {
			delete item.children;
		}
		// No need to delete parent_id as it was never added to the Output type
	});

	return result;
}

type Category = {
	value: number;
	label: string;
	parent_id: number | null;
};
export function findChildren(categories: Category[], id: number): number[] {
	const result: number[] = [];

	const queue: number[] = [id];

	while (queue.length > 0) {
		const categoryId = queue.shift()!;
		const category = categories.find((c) => c.value === categoryId);
		if (!category) continue;

		result.push(category.value);

		const childCategories = categories.filter((c) => c.parent_id === category.value);
		childCategories.forEach((child) => queue.push(child.value));
	}

	return result;
}

export function findParent(
	categories: CustomTreeItem[],
	selected: MaybeGetter<string | undefined>
): string[] {
	const result: string[] = [];
	if (!selected) return result;

	function findParentRecursive(
		items: CustomTreeItem[],
		targetId: MaybeGetter<string | undefined>,
		path: string[]
	): boolean {
		for (const item of items) {
			if (item.id === targetId) {
				result.unshift(...path, item.id);
				return true;
			}
			if (item.children) {
				if (findParentRecursive(item.children, targetId, [...path, item.id])) {
					return true;
				}
			}
		}
		return false;
	}

	findParentRecursive(categories, selected, []);
	return result;
}
