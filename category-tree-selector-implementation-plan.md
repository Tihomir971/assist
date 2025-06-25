# Category Tree Selector Implementation Plan

## Overview
Replace the current category combobox in pricing rules with the tree-view component. Since `CategoryService.Output` and `TreeViewItem` have identical type structures, no data conversion is needed.

## Type Compatibility Analysis

### CategoryService.Output
```typescript
interface Output {
  value: number;
  label: string;
  children?: Output[];
}
```

### TreeViewItem
```typescript
interface TreeViewItem {
  value: number;
  label: string;
  children?: TreeViewItem[];
}
```

**Result**: Types are identical - no conversion function needed!

## Implementation Steps

### Step 1: Update Server-Side Data Loading

**File**: `src/routes/(app)/crm/pricing-rules/[id]/+page.server.ts`

**Change line 75**:
```typescript
// FROM:
new CategoryService(supabase).getLookup(),

// TO:
new CategoryService(supabase).getCategoryTree(),
```

**Update imports**:
```typescript
// Add to existing imports from CategoryService
import type { Output } from '$lib/services/supabase/category.service';
```

### Step 2: Create CategoryTreeSelector Component

**File**: `src/lib/components/pricing-rules/condition-types/CategoryTreeSelector.svelte`

```svelte
<script lang="ts">
	import TreeView from '$lib/components/zag/tree-view/tree-view.svelte';
	import type { Output } from '$lib/services/supabase/category.service';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import XIcon from '@lucide/svelte/icons/x';

	interface Props {
		selectedCategoryIds: number[] | undefined;
		categoriesTree: Output[];
		onCategoriesChange: (categoryIds: number[]) => void;
	}

	let {
		selectedCategoryIds = $bindable([]),
		categoriesTree,
		onCategoriesChange
	}: Props = $props();

	// Bind checkedValue to selectedCategoryIds
	let checkedValue = $state<number[]>(selectedCategoryIds || []);

	// Sync changes back to parent
	$effect(() => {
		onCategoriesChange(checkedValue || []);
	});

	// Helper function to find category by ID for display
	function findCategoryById(categories: Output[], id: number): Output | null {
		for (const category of categories) {
			if (category.value === id) return category;
			if (category.children) {
				const found = findCategoryById(category.children, id);
				if (found) return found;
			}
		}
		return null;
	}

	// Get selected categories for badge display
	const selectedCategories = $derived(() => {
		return (checkedValue || [])
			.map(id => findCategoryById(categoriesTree, id))
			.filter((cat): cat is Output => cat !== null);
	});

	function removeCategory(categoryId: number) {
		checkedValue = (checkedValue || []).filter(id => id !== categoryId);
	}
</script>

<div class="space-y-4">
	<div class="rounded-md border">
		<TreeView 
			items={categoriesTree} 
			selectionMode="multiple" 
			bind:checkedValue 
			label="Kategorije proizvoda"
		/>
	</div>

	{#if selectedCategories.length > 0}
		<div class="flex flex-wrap gap-1">
			{#each selectedCategories as category (category.value)}
				<Badge variant="secondary" class="flex items-center gap-1">
					{category.label}
					<button
						type="button"
						onclick={() => removeCategory(category.value)}
						class="rounded-full hover:bg-muted-foreground/20 focus:outline-none"
						aria-label={`Ukloni kategoriju ${category.label}`}
					>
						<XIcon class="h-3 w-3" />
					</button>
				</Badge>
			{/each}
		</div>
	{/if}

	<p class="text-xs text-muted-foreground">
		Pravilo će se primeniti samo ako proizvod pripada nekoj od izabranih kategorija. Ako nijedna
		kategorija nije izabrana, ovaj uslov se ignoriše.
	</p>
</div>
```

### Step 3: Update ConditionsBuilder

**File**: `src/lib/components/pricing-rules/builders/ConditionsBuilder.svelte`

**Update imports**:
```typescript
// REPLACE:
import CategoriesSelector from '../condition-types/CategoriesSelector.svelte';

// WITH:
import CategoryTreeSelector from '../condition-types/CategoryTreeSelector.svelte';
```

**Update interface Props (line 19-24)**:
```typescript
lookupData: {
	partners: PartnerLookup[];
	categories: Output[]; // Changed from CategoryLookup[]
	attributes: AttributeLookup[];
	brands: BrandLookup[];
};
```

**Add import for Output type**:
```typescript
import type { Output } from '$lib/services/supabase/category.service';
```

**Update component usage (lines 81-86)**:
```svelte
<!-- REPLACE: -->
<CategoriesSelector
	selectedCategoryIds={currentConditions.category_ids || []}
	categoriesLookup={lookupData.categories}
	onCategoriesChange={handleCategoriesChange}
/>

<!-- WITH: -->
<CategoryTreeSelector
	selectedCategoryIds={currentConditions.category_ids || []}
	categoriesTree={lookupData.categories}
	onCategoriesChange={handleCategoriesChange}
/>
```

### Step 4: Update Main Page Component

**File**: `src/routes/(app)/crm/pricing-rules/[id]/+page.svelte`

**No changes needed** - the component interface remains the same, only the internal implementation changes.

## Key Benefits

1. **No Data Conversion**: Types are already compatible
2. **Hierarchical Display**: Users see category relationships
3. **Enhanced Search**: Built-in search functionality
4. **Better UX**: Expand/collapse navigation
5. **Consistent Interface**: Same props as original component

## Testing Checklist

- [ ] Categories load as hierarchical tree
- [ ] Multi-select functionality works
- [ ] Selected categories display as badges
- [ ] Badge removal works correctly
- [ ] Search functionality works
- [ ] Form submission includes correct category_ids
- [ ] Expand/collapse functionality works
- [ ] Responsive design on mobile

## Migration Notes

- The original `CategoriesSelector.svelte` can be kept for backward compatibility
- No database changes required
- No changes to form submission logic
- Existing pricing rules will continue to work unchanged

## Future Enhancements

1. **Parent Selection Logic**: When parent is selected, auto-select children
2. **Indeterminate State**: Show parent as indeterminate when some children selected
3. **Category Path Display**: Show full hierarchy path in badges (e.g., "Electronics > Phones")
4. **Lazy Loading**: For very large category trees
5. **Custom Icons**: Category-specific icons in tree view