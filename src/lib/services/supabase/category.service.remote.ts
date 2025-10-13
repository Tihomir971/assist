import { getRequestEvent, query } from '$app/server';
import { getRPCLookup, type TreeStructure } from './category.service';
// (preferredLocale: string): Promise<TreeStructure[]>
export const getCategoryTree = query(async () => {
	// Automatically detect user's preferred locale and get dynamic default locale
	// const fallbackLocale = await getDefaultLocale(this.supabase);
	const { locals } = getRequestEvent();
	const preferredLocale = locals.app.userLocale;
	const fallbackLocale = locals.app.systemLocale;

	const data = await getRPCLookup(
		locals.supabase,
		'm_product_category',
		'names',
		preferredLocale,
		fallbackLocale,
		{ extraColumn: 'parent_id' }
	);

	const items = data || [];
	if (!items.length) return [];

	const itemMap = new Map<number, TreeStructure>();
	const orphanedNodes: TreeStructure[] = [];

	// Transform data with client-side localization (optimized)
	const transformedItems = items.map((item) => ({
		value: item.value,
		label: item.label,
		parent_id: item.parent_id ? Number(item.parent_id) : null
	}));

	// Initialize the map with items, preparing the basic structure
	transformedItems.forEach((item) => {
		// Create Output object, ensuring children array is initialized
		itemMap.set(item.value, { value: item.value, label: item.label, children: [] });
	});

	const result: TreeStructure[] = [];

	// Build tree structure and collect orphaned nodes
	transformedItems.forEach((item) => {
		const currentItem = itemMap.get(item.value)!; // Non-null assertion is safe due to initialization loop

		if (item.parent_id === null) {
			// Root item
			result.push(currentItem);
		} else {
			const parent = itemMap.get(item.parent_id);
			if (parent) {
				// Parent found, add current item to parent's children
				parent.children!.push(currentItem);
			} else {
				// Parent not found - this is an orphaned node
				// Add it to orphaned nodes collection for potential recovery
				console.warn(
					`Category ${item.value} (${item.label}) has missing parent_id: ${item.parent_id}`
				);
				orphanedNodes.push(currentItem);
			}
		}
	});

	// Add orphaned nodes to root level to prevent data loss
	// This ensures all nodes are visible even if their parent relationships are broken
	if (orphanedNodes.length > 0) {
		console.warn(
			`Found ${orphanedNodes.length} orphaned category nodes, adding them to root level`
		);
		result.push(...orphanedNodes);
	}

	// Clean up: remove empty children arrays
	itemMap.forEach((item) => {
		if (item.children && item.children.length === 0) {
			delete item.children;
		}
	});

	return result;
});
