# Minimal Delete Refresh Fix

## Problem
When deleting a row through SmartRelatedDrawer, the item is removed from database but stays visible in SmartRelatedTable.

## Root Cause
`SmartRelatedTable` calls `onRefresh?.()` after delete, but no `onRefresh` callback is provided.

## Solution: Choose ONE Approach

### Option A: Server Refresh Only (Recommended)
**File**: `src/routes/(app)/catalog/products/[id]/related-configs.ts`

```typescript
import { invalidate } from '$app/navigation';

export function createTabConfigs(data: PageData) {
  const handleRefresh = () => {
    invalidate('catalog:products');
  };

  return [
    createTabConfig('vendors', 'Vendors', SmartRelatedTable, {
      // ... existing props
      onRefresh: handleRefresh // Add only this line
    }),
    // ... repeat for other tabs
  ];
}
```

**That's it!** When delete happens:
1. Database deletion succeeds
2. `onRefresh()` is called
3. `invalidate('catalog:products')` triggers page reload
4. Fresh data loads without deleted item

### Option B: Local State Update Only (Alternative)
**File**: `src/lib/components/forms/SmartRelatedTable.svelte`

```typescript
function handleSave(result?: any) {
  selectedItemId = undefined;

  // Remove deleted item from local state
  if (result?.deleted && result?.id) {
    items = items.filter(item => item.id !== result.id);
  }
  
  // No server refresh needed
}
```

**That's it!** When delete happens:
1. Database deletion succeeds  
2. Item removed from local `items` array
3. UI updates immediately

## Which Option to Choose?

### **Option A (Server Refresh)** - Recommended
- ✅ **Guaranteed Consistency**: Always shows latest server data
- ✅ **Simpler**: No local state manipulation
- ✅ **Safer**: Handles edge cases automatically
- ❌ **Slight Delay**: Brief loading time for refresh

### **Option B (Local Update)** - Alternative  
- ✅ **Instant**: No loading delay
- ❌ **Risk**: Local state might get out of sync
- ❌ **Complex**: Need to handle all operation types

## Recommendation

Use **Option A (Server Refresh)** because:
- It's the safest approach
- Handles all edge cases
- Minimal code change
- Guaranteed data consistency

## Implementation

**Time**: 5 minutes
**Files**: 1 file change
**Risk**: Very low

Just add the `onRefresh: handleRefresh` line to your tab configurations and you're done!