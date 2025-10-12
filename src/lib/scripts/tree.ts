import type { MProductCategoryRow } from '$lib/types/supabase.zod.types';

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
