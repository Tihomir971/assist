import type { TreeItemTitle } from '$lib/components/melt/tree/types';

interface DataTableRow {
	id: number;
	title: string;
	parent_id: number | null;
}

export function arrayToTreeString(items: Array<DataTableRow> | null | undefined) {
	if (!items) return [];
	const itemMap = new Map();

	// Convert numbers to strings and initialize the map
	const stringItems = items.map((item) => ({
		...item,
		id: item.id.toString(),
		parent_id: item.parent_id ? item.parent_id.toString() : null
	}));

	stringItems.forEach((item) => {
		itemMap.set(item.id, { ...item });
	});

	// Create the tree structure
	const result: Array<TreeItemTitle> = [];
	stringItems.forEach((item) => {
		if (item.parent_id === null) {
			const newItem = itemMap.get(item.id);
			if (itemMap.get(item.id).children) {
				newItem.children = itemMap.get(item.id).children;
			}
			result.push(newItem);
		} else {
			const parent = itemMap.get(item.parent_id);
			if (parent) {
				parent.children = parent.children || [];
				parent.children.push(itemMap.get(item.id));
			}
		}
	});

	// Remove parent_id from all items
	stringItems.forEach((item) => {
		const mappedItem = itemMap.get(item.id);
		if ('parent_id' in mappedItem) {
			delete mappedItem.parent_id;
		}
	});

	return result;
}

type Category = {
	id: number;
	parent_id: number | null;
	title: string;
};
export function findChildren(categories: Category[], id: number): number[] {
	const result: number[] = [];

	const queue: number[] = [id];

	while (queue.length > 0) {
		const categoryId = queue.shift()!;
		const category = categories.find((c) => c.id === categoryId);
		if (!category) continue;

		result.push(category.id);

		const childCategories = categories.filter((c) => c.parent_id === category.id);
		childCategories.forEach((child) => queue.push(child.id));
	}

	return result;
}

export function findParent(categories: TreeItemTitle[], id: string | null): string[] {
	const result: string[] = [];
	if (!id) return result;

	function findParentRecursive(items: TreeItemTitle[], targetId: string, path: string[]): boolean {
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

	findParentRecursive(categories, id, []);
	return result;
}
