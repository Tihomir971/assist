import type { TreeItem } from '$lib/components/treeview';

interface DataTableRow {
	id: number;
	title: string;
	parent_id: number | null;
}

function arrayToTree(items: Array<DataTableRow>) {
	const stringItems = items.map((category) => {
		return {
			...category,
			id: category.id.toString(),
			parent_id: category.parent_id ? category.parent_id.toString() : null
		};
	});
	const itemMap = new Map();

	// Initialize the map with all items
	stringItems.forEach((item) => {
		itemMap.set(item.id, { ...item });
	});

	// Create the tree structure
	const result: Array<TreeItem> = [];
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
export function convertToTreeStructure(data: Array<DataTableRow> | null): TreeItem[] {
	if (!data) return [];

	//return createTree(data);
	return arrayToTree(data);
}
