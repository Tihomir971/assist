# Subcategory Pricing Rules Implementation Plan

## Overview
Implement inheritable pricing rules that can apply to parent categories and automatically include all their subcategories. Uses a hybrid approach for optimal performance and data consistency.

## Architecture Decision: Hybrid Approach

### Data Model Changes

```typescript
interface PricingConditions {
  partner_ids?: number[];
  product_ids?: number[];
  category_ids?: number[];           // Original selected categories
  brand_ids?: number[];
  
  // New subcategory support fields
  apply_to_subcategories?: boolean;  // User toggle flag
  expanded_category_ids?: number[];  // Auto-generated: category_ids + all subcategories
  category_expansion_timestamp?: string; // When expansion was calculated
  
  attributes?: AttributeCondition[];
  min_quantity?: number;
  max_quantity?: number;
  min_order_value?: number;
}
```

## Implementation Steps

### 1. Update Type Definitions

**File: `src/lib/types/pricing-rules.types.ts`**
```typescript
export interface PricingConditions {
  // ... existing fields
  apply_to_subcategories?: boolean;
  expanded_category_ids?: number[];
  category_expansion_timestamp?: string;
}
```

**File: `src/lib/types/pricing-rules.zod.ts`**
```typescript
export const pricingConditionsSchema = z.object({
  // ... existing fields
  apply_to_subcategories: z.boolean().optional(),
  expanded_category_ids: z.array(z.number()).optional(),
  category_expansion_timestamp: z.string().optional()
});
```

### 2. Database Function Update

**File: `supabase/sql/find_applicable_pricing_rules.sql`**

The function needs to check BOTH `category_ids` and `expanded_category_ids`:

```sql
CREATE OR REPLACE FUNCTION find_applicable_pricing_rules(
  p_product_id INTEGER,
  p_partner_id INTEGER DEFAULT NULL,
  p_quantity NUMERIC DEFAULT 1,
  p_order_value NUMERIC DEFAULT NULL,
  p_target_group TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  conditions JSONB,
  formula JSONB,
  priority INTEGER,
  target_group TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.name,
    pr.conditions,
    pr.formula,
    pr.priority,
    pr.target_group
  FROM pricing_rules pr
  JOIN m_product p ON p.id = p_product_id
  WHERE pr.is_active = true
    AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
    AND (pr.ends_at IS NULL OR pr.ends_at >= NOW())
    AND (pr.target_group IS NULL OR pr.target_group = p_target_group)
    
    -- Partner condition
    AND (
      (pr.conditions->>'partner_ids') IS NULL 
      OR p_partner_id = ANY(
        SELECT jsonb_array_elements_text(pr.conditions->'partner_ids')::INTEGER
      )
    )
    
    -- Product condition
    AND (
      (pr.conditions->>'product_ids') IS NULL 
      OR p_product_id = ANY(
        SELECT jsonb_array_elements_text(pr.conditions->'product_ids')::INTEGER
      )
    )
    
    -- Category condition - CHECK BOTH ARRAYS
    AND (
      (pr.conditions->>'category_ids') IS NULL 
      OR p.m_product_category_id = ANY(
        SELECT jsonb_array_elements_text(pr.conditions->'category_ids')::INTEGER
      )
      OR (
        pr.conditions->>'expanded_category_ids' IS NOT NULL
        AND p.m_product_category_id = ANY(
          SELECT jsonb_array_elements_text(pr.conditions->'expanded_category_ids')::INTEGER
        )
      )
    )
    
    -- Brand condition
    AND (
      (pr.conditions->>'brand_ids') IS NULL 
      OR p.m_product_brand_id = ANY(
        SELECT jsonb_array_elements_text(pr.conditions->'brand_ids')::INTEGER
      )
    )
    
    -- Quantity conditions
    AND (
      (pr.conditions->>'min_quantity') IS NULL 
      OR p_quantity >= (pr.conditions->>'min_quantity')::NUMERIC
    )
    AND (
      (pr.conditions->>'max_quantity') IS NULL 
      OR p_quantity <= (pr.conditions->>'max_quantity')::NUMERIC
    )
    
    -- Order value condition
    AND (
      (pr.conditions->>'min_order_value') IS NULL 
      OR p_order_value IS NULL
      OR p_order_value >= (pr.conditions->>'min_order_value')::NUMERIC
    )
    
  ORDER BY pr.priority ASC, pr.id ASC;
END;
$$;
```

### 3. Backend Service Updates

**File: `src/lib/services/supabase/category.service.ts`**

Add method to get all descendant category IDs:

```typescript
export class CategoryService {
  // ... existing methods

  /**
   * Get all descendant category IDs for given parent categories
   */
  async getDescendantIds(parentIds: number[]): Promise<number[]> {
    if (!parentIds.length) return [];

    const { data, error } = await this.supabase.rpc('get_category_descendants', {
      parent_ids: parentIds
    });

    if (error) throw new Error(`Failed to get category descendants: ${error.message}`);
    return data || [];
  }

  /**
   * Expand category IDs to include all subcategories
   */
  async expandCategoryIds(categoryIds: number[]): Promise<{
    expanded_ids: number[];
    timestamp: string;
  }> {
    const descendants = await this.getDescendantIds(categoryIds);
    const allIds = [...new Set([...categoryIds, ...descendants])]; // Remove duplicates
    
    return {
      expanded_ids: allIds,
      timestamp: new Date().toISOString()
    };
  }
}
```

**Database Function for Category Descendants:**

```sql
CREATE OR REPLACE FUNCTION get_category_descendants(parent_ids INTEGER[])
RETURNS INTEGER[]
LANGUAGE plpgsql
AS $$
DECLARE
  result INTEGER[];
BEGIN
  WITH RECURSIVE category_tree AS (
    -- Base case: start with parent categories
    SELECT id, parent_id, 0 as level
    FROM m_product_category 
    WHERE id = ANY(parent_ids)
    
    UNION ALL
    
    -- Recursive case: find children
    SELECT c.id, c.parent_id, ct.level + 1
    FROM m_product_category c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
    WHERE ct.level < 10 -- Prevent infinite recursion
  )
  SELECT ARRAY_AGG(DISTINCT id) INTO result
  FROM category_tree;
  
  RETURN COALESCE(result, ARRAY[]::INTEGER[]);
END;
$$;
```

### 4. Frontend UI Updates

**File: `src/lib/components/pricing-rules/condition-types/CategoriesSelector.svelte`**

```svelte
<script lang="ts">
  import { CategoryService } from '$lib/services/supabase/category.service';
  
  interface Props {
    selectedCategoryIds: number[];
    categories: CategoryLookup[];
    applyToSubcategories: boolean;
    expandedCategoryIds: number[];
    onSelectionChange: (ids: number[]) => void;
    onSubcategoryToggle: (apply: boolean) => void;
    supabase: SupabaseClient<Database>;
  }

  let { 
    selectedCategoryIds, 
    categories, 
    applyToSubcategories,
    expandedCategoryIds,
    onSelectionChange, 
    onSubcategoryToggle,
    supabase 
  }: Props = $props();

  async function handleSubcategoryToggle(checked: boolean) {
    onSubcategoryToggle(checked);
    
    if (checked && selectedCategoryIds.length > 0) {
      // Expand categories immediately for UI feedback
      const categoryService = new CategoryService(supabase);
      const { expanded_ids } = await categoryService.expandCategoryIds(selectedCategoryIds);
      // This will be handled by parent component
    }
  }

  // Get category names for display
  const expandedCategoryNames = $derived(() => {
    if (!applyToSubcategories) return [];
    return expandedCategoryIds
      .filter(id => !selectedCategoryIds.includes(id))
      .map(id => categories.find(c => c.value === id)?.label)
      .filter(Boolean);
  });
</script>

<div class="space-y-4">
  <!-- Category Multi-Select -->
  <div class="space-y-2">
    <Label>Categories</Label>
    <!-- Your existing category selector component -->
  </div>

  <!-- Apply to Subcategories Toggle -->
  {#if selectedCategoryIds.length > 0}
    <div class="space-y-2">
      <div class="flex items-center space-x-2">
        <Switch 
          id="apply-subcategories" 
          checked={applyToSubcategories}
          onCheckedChange={handleSubcategoryToggle}
        />
        <Label for="apply-subcategories">Apply to all subcategories</Label>
      </div>
      
      {#if applyToSubcategories && expandedCategoryNames.length > 0}
        <div class="text-sm text-muted-foreground">
          <p>Will also apply to: {expandedCategoryNames.join(', ')}</p>
          <p class="text-xs">Total categories: {expandedCategoryIds.length}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
```

### 5. Form Integration

**File: `src/lib/components/pricing-rules/builders/ConditionsBuilder.svelte`**

```svelte
<script lang="ts">
  // ... existing imports
  import { CategoryService } from '$lib/services/supabase/category.service';

  async function handleSubcategoryToggle(apply: boolean) {
    const newConditions = { ...currentConditions };
    newConditions.apply_to_subcategories = apply;

    if (apply && newConditions.category_ids?.length) {
      // Expand categories
      const categoryService = new CategoryService(supabase);
      const { expanded_ids, timestamp } = await categoryService.expandCategoryIds(
        newConditions.category_ids
      );
      
      newConditions.expanded_category_ids = expanded_ids;
      newConditions.category_expansion_timestamp = timestamp;
    } else {
      // Clear expansion
      newConditions.expanded_category_ids = undefined;
      newConditions.category_expansion_timestamp = undefined;
    }

    onConditionsChange(newConditions);
  }

  async function handleCategorySelectionChange(categoryIds: number[]) {
    const newConditions = { ...currentConditions };
    newConditions.category_ids = categoryIds.length > 0 ? categoryIds : undefined;

    // If subcategories are enabled, re-expand
    if (newConditions.apply_to_subcategories && categoryIds.length > 0) {
      const categoryService = new CategoryService(supabase);
      const { expanded_ids, timestamp } = await categoryService.expandCategoryIds(categoryIds);
      
      newConditions.expanded_category_ids = expanded_ids;
      newConditions.category_expansion_timestamp = timestamp;
    } else if (categoryIds.length === 0) {
      // Clear everything if no categories selected
      newConditions.apply_to_subcategories = false;
      newConditions.expanded_category_ids = undefined;
      newConditions.category_expansion_timestamp = undefined;
    }

    onConditionsChange(newConditions);
  }
</script>

<CategoriesSelector
  selectedCategoryIds={currentConditions.category_ids || []}
  categories={lookupData.categories}
  applyToSubcategories={currentConditions.apply_to_subcategories || false}
  expandedCategoryIds={currentConditions.expanded_category_ids || []}
  onSelectionChange={handleCategorySelectionChange}
  onSubcategoryToggle={handleSubcategoryToggle}
  {supabase}
/>
```

## Benefits of This Approach

1. **Performance**: Price calculation uses pre-computed `expanded_category_ids` array
2. **Transparency**: Users can see exactly which categories are included
3. **Consistency**: Expansion can be refreshed when category hierarchy changes
4. **Flexibility**: Can fall back to real-time expansion if needed
5. **Debugging**: Easy to troubleshoot which categories are being matched

## Migration Strategy

1. **Phase 1**: Add new fields to types and database
2. **Phase 2**: Update database function to check both arrays
3. **Phase 3**: Update UI to support subcategory toggle
4. **Phase 4**: Add background job to refresh stale expansions (optional)

## Performance Considerations

- **Database**: Checking two arrays instead of one has minimal impact
- **Storage**: Expanded arrays will use more space but improve query performance
- **UI**: Real-time expansion provides immediate feedback
- **Maintenance**: Timestamp allows for intelligent refresh strategies

## Testing Strategy

1. **Unit Tests**: Test category expansion logic
2. **Integration Tests**: Test price calculation with expanded categories
3. **UI Tests**: Test toggle behavior and visual feedback
4. **Performance Tests**: Measure impact on price calculation speed