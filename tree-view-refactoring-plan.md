# Tree View Component Refactoring Plan

## Current Issues Analysis

After examining your tree-view component and the Zag.js documentation, I've identified the core issues:

### 1. **Type Inconsistency**
- Current types define `value?: number | null` 
- But Zag.js tree-view machine expects `selectedValue?: string[]`
- Component uses both `value` and `defaultSelectedValue` props inconsistently

### 2. **Data Flow Complexity**
- **Supabase returns `id` as `number`**
- **Zag.js expects `selectedValue` as `string[]`**
- **Conversion happens via `nodeToValue: (node) => node.value.toString()`**
- **URL params are strings, so we need proper conversion both ways**

### 3. **Expansion Issue**
- **Zag doesn't automatically expand parent nodes when `selectedValue` is passed**
- **Your `getParentValues` function is needed to calculate initial `expandedValue`**
- **After initial setup, Zag manages `expandedValue` internally**

## Data Flow Understanding

```
Supabase DB → number (id: 123)
     ↓
arrayToTree() → TreeViewItem { value: 123, label: "Category" }
     ↓
nodeToValue() → string ("123")
     ↓
Zag selectedValue → string[] (["123"])
     ↓
URL params → string ("cat=123")
     ↓
parseInt() → number (123) for business logic
```

## Correct Refactoring Approach

### Step 1: Fix Types (Account for Number/String Conversion)

```typescript
// src/lib/components/zag/tree-view/types.ts
import * as tree from '@zag-js/tree-view';

export interface TreeViewProps<T extends TreeViewItem>
  extends Omit<tree.Props, 'id' | 'collection'> {
  // Omit 'id' because we get it via $props.id() inside component
  // Omit 'collection' because we build it internally from items
  // Keep Zag's native selectedValue and expandedValue types (string[])
  
  /** Provide the list of label and value data */
  items?: T[];
  label?: string;
  /** Context menu node */
  contextNode?: string | null;
}

export interface TreeViewItem {
  value: number; // From Supabase - stays as number
  label: string;
  children?: TreeViewItem[];
}
```

### Step 2: Update Component (Use $props.id() and Proper Expansion)

```svelte
<!-- src/lib/components/zag/tree-view/tree-view.svelte -->
<script lang="ts" generics="T extends TreeViewItem">
  import type { TreeViewItem, TreeViewProps } from './types';
  // ... other imports

  let {
    items = [],
    label,
    contextNode = $bindable(),
    selectedValue = $bindable([]), // string[] - Zag's native type
    onSelectionChange,
    onExpandedChange,
    ...restProps
  }: TreeViewProps<T> = $props();

  // Get id from $props.id() - not passed as parameter
  const id = $props.id();

  // Create collection with proper number→string conversion
  const collection = $derived(
    tree.collection<TreeViewItem>({
      nodeToValue: (node) => node.value.toString(), // number → string
      nodeToString: (node) => node.label,
      rootNode: {
        value: 0, // Root node with number value
        label: '',
        children: items
      }
    })
  );

  // Calculate initial expanded values based on selected values
  // This is needed because Zag doesn't auto-expand parents when selectedValue is set
  const getParentValues = (targetValues: string[]): string[] => {
    if (!targetValues?.length) return [];
    const allParentValues = new Set<string>();
    for (const targetValue of targetValues) {
      const parentNodes = collection.getParentNodes(targetValue);
      if (parentNodes) {
        parentNodes.forEach((node) => allParentValues.add(node.value.toString()));
      }
    }
    return Array.from(allParentValues);
  };

  // Calculate initial expandedValue - only needed for initial setup
  const initialExpandedValue = $derived(getParentValues(selectedValue || []));

  // Zag machine setup
  const service = useMachine(tree.machine, {
    id, // From $props.id()
    collection,
    selectedValue, // string[]
    expandedValue: initialExpandedValue, // Initial expansion based on selection
    onSelectionChange,
    onExpandedChange, // Zag manages expandedValue after this
    ...restProps
  });

  const api = $derived(tree.connect(service, normalizeProps));
</script>
```

### Step 3: Update Layout Usage (No id Parameter)

```svelte
<!-- src/routes/(app)/catalog/+layout.svelte -->
<script lang="ts">
  // ... existing imports and setup

  const initCategory = page.url.searchParams.get('cat');
  // selectedCategory is string[] for Zag component
  let selectedCategory = $state(initCategory ? [initCategory] : []);
  
  // Derived value for business logic (convert back to number)
  const currentCategoryId = $derived(
    selectedCategory?.[0] ? parseInt(selectedCategory[0]) : undefined
  );
</script>

<TreeViewZag
  id="category-tree"
  items={treeData}
  bind:contextNode
  bind:selectedValue={selectedCategory} <!-- string[] -->
  onSelectionChange={({ focusedValue }) => {
    if (!focusedValue) return;
    // focusedValue is string, URL expects string - no conversion needed
    const newUrl = new URL(page.url);
    newUrl.searchParams.set('cat', focusedValue);
    newUrl.searchParams.delete('search');
    goto(newUrl, { invalidate: ['catalog:products'] });
  }}
/>

<!-- Use currentCategoryId (number) for business logic -->
<DialogSelectReport
  bind:showReportDialog
  warehouses={data.warehouses}
  activeCategory={currentCategoryId?.toString()}
/>
```

## Key Changes Made

### 1. **Component Props Interface**
```typescript
// Before (confusing)
let { id, items, ... }: TreeViewProps<T> & { id: string } = $props();

// After (clean)
let { items, ... }: TreeViewProps<T> = $props();
const id = $props.id(); // Get id internally
```

### 2. **Types Interface**
```typescript
// We omit 'id' because component gets it via $props.id()
export interface TreeViewProps<T extends TreeViewItem>
  extends Omit<tree.Props, 'id' | 'collection'> {
  // No id parameter needed
}
```

### 3. **Usage**
```svelte
<!-- Clean usage - id is passed as normal prop -->
<TreeViewZag
  id="category-tree"
  items={treeData}
  bind:selectedValue={selectedCategory}
/>
```

## Why This Approach is Better

### 1. **Cleaner Props Interface**
- No need for intersection types `TreeViewProps<T> & { id: string }`
- Component handles `id` internally via `$props.id()`
- Consistent with other Zag components

### 2. **Better Type Safety**
- `id` is required at usage site (TypeScript will enforce)
- No confusion about whether `id` is in props or separate parameter
- Cleaner component signature

### 3. **Consistent with Zag Patterns**
- Most Zag components expect `id` as a prop
- Component extracts it internally via `$props.id()`
- Follows established patterns

## Migration Summary

1. **Types**: Remove `id` from interface (it's omitted anyway)
2. **Component**: Use `const id = $props.id()` instead of destructuring
3. **Usage**: Pass `id` as normal prop (no change needed)
4. **Props**: Cleaner interface without intersection types

This approach gives you the clean internal handling you want while maintaining proper TypeScript safety and Zag.js patterns.