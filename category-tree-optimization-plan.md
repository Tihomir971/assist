# Category Tree Optimization Plan

## Problem Statement

The product category tree with 390+ rows is currently being loaded on every page request in the main layout server (`src/routes/(app)/+layout.server.ts`). This creates unnecessary database queries and performance overhead, especially since the data is used both as a tree structure for navigation and as value-label lookup for forms.

## Current Usage Analysis

### Where Category Tree is Used:
1. **Main Layout Server** (`src/routes/(app)/+layout.server.ts`) - Loads on every page via `categoryService.getCategoryTree()`
2. **Catalog Layout Server** (`src/routes/(app)/catalog/+layout.server.ts`) - Inherits from parent via `await parent()`
3. **Catalog Page Server** (`src/routes/(app)/catalog/+page.server.ts`) - Uses `getCategoryTreeCollection()` for descendant lookups

### Data Usage Patterns:
- **Tree Structure**: For navigation and hierarchical display
- **Flat Lookup**: For form dropdowns and filters (`{ value: number; label: string }[]`)
- **TreeCollection**: For advanced operations like finding descendants

## Optimization Strategy: Pure Client-Side Caching

### Core Principle
Move from server-side loading to pure client-side caching where:
- Layout server **never** loads category tree
- Categories are loaded on-demand with smart caching
- Cache is locale-aware and has proper invalidation

## Implementation Plan

### Phase 1: Create Client-Side Category Manager

#### 1.1 Category Tree Store (`src/lib/stores/category-tree.svelte.ts`)

```typescript
interface CategoryTreeCache {
  data: TreeStructure[];
  timestamp: number;
  version: string;
  userLocale: string; // Track locale for cache invalidation
}

class CategoryTreeManager {
  private storage = new LocalStorage<CategoryTreeCache>('category-tree-cache', {
    data: [],
    timestamp: 0,
    version: '1.0',
    userLocale: ''
  });

  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private supabase: SupabaseClient<Database>;
  private isLoading = $state(false);
  private treeCollection: TreeCollection<TreeStructure> | null = null;

  // Main methods:
  async getCategories(userLocale?: string): Promise<TreeStructure[]>
  async getLookup(userLocale?: string): Promise<Array<{ value: number; label: string }>>
  async getTreeCollection(userLocale?: string): Promise<TreeCollection<TreeStructure>>
  async refresh(userLocale?: string): Promise<TreeStructure[]>
  invalidate(): void
}
```

**Features:**
- 30-minute cache duration
- Locale-aware caching (cache invalidates when user changes locale)
- Supports all three usage patterns (tree, lookup, TreeCollection)
- Uses existing `LocalStorage` class for persistence
- Reactive state management with Svelte 5

#### 1.2 Initialization in Layout (`src/routes/(app)/+layout.svelte`)

```typescript
// Initialize category tree manager
const categoryManager = initializeCategoryTreeManager(data.supabase);

onMount(() => {
  // Clear cache on auth changes
  const { data: { subscription } } = data.supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      categoryManager.invalidate();
    }
  });
  return () => subscription.unsubscribe();
});
```

### Phase 2: Remove Server-Side Loading

#### 2.1 Simplify Layout Server (`src/routes/(app)/+layout.server.ts`)

```typescript
export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, depends }) => {
  depends('user:preferences');

  const { session } = await safeGetSession();
  if (!session) redirect(303, '/');

  const [profile, availableLocales, userPreferences] = await Promise.all([
    // ... existing profile loading
    localeService.getLocales(),
    preferencesService.getUserPreferences(session.user.id)
  ]);

  return {
    session,
    profile,
    // categoryTree removed entirely!
    localePreferences: {
      preferredDataLocale: effectiveDataLocale,
      availableLocales
    }
  };
};
```

**Impact:** Eliminates 390-row database query from every page load.

#### 2.2 Update Catalog Layout (`src/routes/(app)/catalog/+layout.server.ts`)

```typescript
export const load: LayoutServerLoad = async ({ url, locals: { supabase } }) => {
  // ... warehouse logic
  return {
    // categories removed - will be loaded client-side
    warehouses: await getWarehouses(),
    activeWarehouse
  };
};
```

### Phase 3: Update Components to Use Client-Side Data

#### 3.1 Category Tree Provider Component (`src/lib/components/CategoryTreeProvider.svelte`)

```svelte
<script lang="ts">
  import { categoryTreeManager } from '$lib/stores/category-tree.svelte';
  import { getLocaleManagerContext } from '$lib/stores/locale-manager.svelte';
  
  let { children } = $props();
  const localeManager = getLocaleManagerContext();
  
  // Reactive category data
  let categories = $state<TreeStructure[]>([]);
  let loading = $derived(categoryTreeManager.loading);
  
  // Load categories when component mounts or locale changes
  $effect(async () => {
    const userLocale = localeManager?.state.preferredDataLocale;
    try {
      categories = await categoryTreeManager.getCategories(userLocale);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  });
  
  // Provide categories to children via context
  setContext('categories', {
    data: () => categories,
    loading: () => loading,
    getLookup: () => categoryTreeManager.getLookup(userLocale),
    getTreeCollection: () => categoryTreeManager.getTreeCollection(userLocale),
    refresh: () => categoryTreeManager.refresh(userLocale)
  });
</script>

{@render children()}
```

#### 3.2 Update Catalog Page for TreeCollection Usage

For the catalog page that currently uses `getCategoryTreeCollection()` for descendant lookups:

```typescript
// Client-side descendant lookup
const categoryContext = getContext('categories');
const treeCollection = await categoryContext.getTreeCollection();
const descendantValues = treeCollection.getDescendantValues(categoryId);
const categoryIds = descendantValues.map((value: string) => parseInt(value));
```

### Phase 4: Cache Invalidation Strategy

#### 4.1 Category CRUD Operations

In category edit/create/delete operations:

```typescript
import { categoryTreeManager } from '$lib/stores/category-tree.svelte';
import { invalidate } from '$app/navigation';

export const actions = {
  upsert: async ({ request, locals: { supabase } }) => {
    // ... existing CRUD logic
    
    if (result.success) {
      // Clear client-side cache
      categoryTreeManager.invalidate();
      
      // Invalidate any server-side dependencies
      invalidate('catalog:categories');
      
      return { success: true };
    }
  }
};
```

#### 4.2 Automatic Invalidation Triggers

- **Auth state changes**: Clear cache when user logs in/out
- **Locale changes**: Cache is locale-aware and auto-invalidates
- **Manual refresh**: Provide refresh capability in UI
- **Time-based**: 30-minute automatic expiration

## Benefits

### Performance Improvements
- **Eliminates 390-row query** from every page load
- **Reduces server load** and database connections
- **Faster page loads** especially for non-catalog pages
- **Bandwidth savings** from reduced data transfer

### User Experience
- **Instant category access** after first load
- **Offline capability** with localStorage persistence
- **Locale-aware caching** respects user preferences
- **Seamless navigation** without loading delays

### Technical Benefits
- **Maintains compatibility** with existing TreeCollection usage
- **Leverages existing infrastructure** (LocalStorage class)
- **Reactive updates** with Svelte 5 state management
- **Centralized cache management** with proper invalidation

## Implementation Timeline

### Week 1: Foundation
- [ ] Create CategoryTreeManager class
- [ ] Implement basic caching with LocalStorage
- [ ] Add locale awareness
- [ ] Create initialization system

### Week 2: Integration
- [ ] Remove categoryTree from layout server
- [ ] Update catalog layout server
- [ ] Create CategoryTreeProvider component
- [ ] Test basic functionality

### Week 3: Advanced Features
- [ ] Implement TreeCollection caching
- [ ] Update catalog page descendant lookup
- [ ] Add cache invalidation to CRUD operations
- [ ] Performance testing and optimization

### Week 4: Testing & Deployment
- [ ] Comprehensive testing across all usage patterns
- [ ] Performance benchmarking
- [ ] Error handling and edge cases
- [ ] Production deployment

## Risk Mitigation

### Potential Issues
1. **Cache inconsistency**: Mitigated by proper invalidation strategy
2. **Initial load delay**: Acceptable trade-off for overall performance gain
3. **Memory usage**: LocalStorage has reasonable limits, 390 rows is manageable
4. **Browser compatibility**: LocalStorage is universally supported

### Fallback Strategy
- Keep existing server-side methods as fallback
- Graceful degradation if client-side loading fails
- Error boundaries to prevent app crashes

## Success Metrics

### Performance Targets
- **Reduce layout server load time** by eliminating category query
- **Improve Time to First Byte (TTFB)** for all pages
- **Reduce database connections** by ~50% (rough estimate)
- **Maintain sub-100ms category access** after first load

### Monitoring
- Track cache hit/miss ratios
- Monitor client-side loading performance
- Measure overall page load improvements
- User experience metrics (perceived performance)

## Conclusion

This optimization strategy transforms the category tree from a performance bottleneck into an efficient, cached resource. By moving to pure client-side caching with smart invalidation, we eliminate unnecessary server load while maintaining all existing functionality and improving user experience.

The approach is backward-compatible, uses existing infrastructure, and provides a foundation for similar optimizations with other frequently-accessed data.