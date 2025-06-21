import type { MProductCategoryRow } from '$lib/types/supabase.zod.schemas.d';

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

export function findChildren(categories: MProductCategoryRow[], id: number): number[] {
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
