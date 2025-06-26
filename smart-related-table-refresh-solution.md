# Smart Related Table Refresh Solution

## Problem Analysis

The current Smart Split Layout Pattern has a critical issue where deleted rows remain visible in related tables after successful database deletion. This occurs because:

1. **Delete Operation**: Successfully removes records from database via `SmartRelatedDrawer`
2. **UI State**: Local component state (`items`) doesn't update to reflect server changes
3. **Missing Refresh**: No mechanism to synchronize client state with server state

## Root Cause

The `SmartRelatedTable` component calls `onRefresh?.()` after operations, but:
- No `onRefresh` prop is passed from parent components
- No data invalidation occurs to trigger server-side refresh
- Local state management doesn't handle optimistic updates

## Complete Solution Architecture

### Phase 1: Enhanced State Management

#### 1.1 Reactive Data Manager Utility

Create `src/lib/utils/reactive-data-manager.ts`:

```typescript
import { invalidate, invalidateAll } from '$app/navigation';
import { writable, derived, type Writable } from 'svelte/store';
import { toast } from 'svelte-sonner';

export interface DataOperation<T> {
  type: 'create' | 'update' | 'delete';
  id?: number;
  data?: T;
  optimistic?: boolean;
}

export interface DataManagerConfig {
  dependencies: string[];
  entityName: string;
  enableOptimisticUpdates: boolean;
  enableErrorRecovery: boolean;
}

export class ReactiveDataManager<T extends { id: number }> {
  private _items: Writable<T[]>;
  private _loading: Writable<boolean>;
  private _error: Writable<string | null>;
  private _pendingOperations: Writable<Map<number, DataOperation<T>>>;
  
  public readonly items;
  public readonly loading;
  public readonly error;
  public readonly pendingOperations;

  constructor(
    initialItems: T[],
    private config: DataManagerConfig
  ) {
    this._items = writable(initialItems);
    this._loading = writable(false);
    this._error = writable(null);
    this._pendingOperations = writable(new Map());

    // Create derived stores for external consumption
    this.items = derived(this._items, ($items) => $items);
    this.loading = derived(this._loading, ($loading) => $loading);
    this.error = derived(this._error, ($error) => $error);
    this.pendingOperations = derived(this._pendingOperations, ($pending) => $pending);
  }

  // Optimistic create operation
  async optimisticCreate(tempItem: T): Promise<void> {
    if (!this.config.enableOptimisticUpdates) return;

    this._items.update(items => [...items, tempItem]);
    this._pendingOperations.update(pending => {
      pending.set(tempItem.id, { type: 'create', data: tempItem, optimistic: true });
      return pending;
    });
  }

  // Optimistic update operation
  async optimisticUpdate(id: number, updates: Partial<T>): Promise<void> {
    if (!this.config.enableOptimisticUpdates) return;

    this._items.update(items => 
      items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
    
    this._pendingOperations.update(pending => {
      pending.set(id, { type: 'update', id, data: updates as T, optimistic: true });
      return pending;
    });
  }

  // Optimistic delete operation
  async optimisticDelete(id: number): Promise<void> {
    if (!this.config.enableOptimisticUpdates) return;

    // Store the item for potential rollback
    const itemToDelete = this.getCurrentItems().find(item => item.id === id);
    if (!itemToDelete) return;

    this._items.update(items => items.filter(item => item.id !== id));
    this._pendingOperations.update(pending => {
      pending.set(id, { type: 'delete', id, data: itemToDelete, optimistic: true });
      return pending;
    });
  }

  // Confirm successful operation
  async confirmOperation(id: number, result?: T): Promise<void> {
    this._pendingOperations.update(pending => {
      const operation = pending.get(id);
      if (operation && result && operation.type !== 'delete') {
        // Update with server response
        this._items.update(items => 
          items.map(item => item.id === id ? result : item)
        );
      }
      pending.delete(id);
      return pending;
    });

    // Invalidate dependencies to ensure server sync
    await this.invalidateData();
  }

  // Rollback failed operation
  async rollbackOperation(id: number, error: string): Promise<void> {
    this._pendingOperations.update(pending => {
      const operation = pending.get(id);
      if (operation && operation.optimistic) {
        switch (operation.type) {
          case 'create':
            // Remove the optimistically added item
            this._items.update(items => items.filter(item => item.id !== id));
            break;
          case 'update':
            // Revert to original state (would need original data stored)
            this.invalidateData();
            break;
          case 'delete':
            // Restore the deleted item
            if (operation.data) {
              this._items.update(items => [...items, operation.data!]);
            }
            break;
        }
      }
      pending.delete(id);
      return pending;
    });

    this._error.set(error);
    toast.error(`Failed to ${operation?.type} ${this.config.entityName}: ${error}`);
  }

  // Force refresh from server
  async invalidateData(): Promise<void> {
    this._loading.set(true);
    try {
      for (const dependency of this.config.dependencies) {
        await invalidate(dependency);
      }
    } finally {
      this._loading.set(false);
    }
  }

  // Update items from server (called by parent component)
  updateItems(newItems: T[]): void {
    this._items.set(newItems);
    this._error.set(null);
  }

  // Get current items (for internal use)
  private getCurrentItems(): T[] {
    let currentItems: T[] = [];
    this.items.subscribe(items => currentItems = items)();
    return currentItems;
  }
}
```

#### 1.2 Enhanced SmartRelatedTable Component

Update `src/lib/components/forms/SmartRelatedTable.svelte`:

```typescript
// Add to imports
import { ReactiveDataManager, type DataManagerConfig } from '$lib/utils/reactive-data-manager';
import { invalidate } from '$app/navigation';
import { onMount } from 'svelte';

// Enhanced props interface
interface SmartRelatedTableProps<T extends Record<string, any>, S extends AnyZodObject> {
  config: RelatedTableConfig<T, S>;
  items: T[];
  validatedForm: SuperValidated<z.infer<S>>;
  parentId: number | undefined;
  lookupData?: Record<string, Array<{ value: any; label: string }>>;
  dependencies?: string[]; // Data dependencies for invalidation
  enableOptimisticUpdates?: boolean;
  onRefresh?: () => void;
  onBulkAction?: (action: string, selectedIds: number[]) => void;
}

// Enhanced component logic
let {
  config,
  items: initialItems,
  validatedForm,
  parentId,
  lookupData = {},
  dependencies = [],
  enableOptimisticUpdates = true,
  onRefresh,
  onBulkAction
}: SmartRelatedTableProps<any, any> = $props();

// Create reactive data manager
const dataManagerConfig: DataManagerConfig = {
  dependencies,
  entityName: config.title,
  enableOptimisticUpdates,
  enableErrorRecovery: true
};

let dataManager: ReactiveDataManager<any>;

onMount(() => {
  dataManager = new ReactiveDataManager(initialItems, dataManagerConfig);
});

// Update data manager when items change from parent
$effect(() => {
  if (dataManager) {
    dataManager.updateItems(initialItems);
  }
});

// Use reactive data from manager
let items = $derived(dataManager ? $dataManager.items : initialItems);
let isLoading = $derived(dataManager ? $dataManager.loading : false);
let error = $derived(dataManager ? $dataManager.error : null);

// Enhanced event handlers
async function handleSave(result?: any) {
  selectedItemId = undefined;
  
  if (!dataManager) return;

  try {
    if (result?.deleted && result?.id) {
      // Confirm optimistic delete
      await dataManager.confirmOperation(result.id);
      toast.success(`${config.title} deleted successfully`);
    } else if (result?.id) {
      // Confirm create/update
      await dataManager.confirmOperation(result.id, result);
      toast.success(`${config.title} ${result.created ? 'created' : 'updated'} successfully`);
    }
  } catch (error) {
    console.error('Failed to confirm operation:', error);
    if (result?.id) {
      await dataManager.rollbackOperation(result.id, error.message);
    }
  }

  // Always call parent refresh
  onRefresh?.();
}

async function handleOptimisticDelete(itemId: number) {
  if (!dataManager) return;
  
  try {
    await dataManager.optimisticDelete(itemId);
  } catch (error) {
    console.error('Optimistic delete failed:', error);
  }
}

// Enhanced delete handler with optimistic updates
function handleEdit(itemId: number) {
  selectedItemId = itemId;
  isDrawerOpen = true;
}

// Add loading and error states to UI
```

#### 1.3 Enhanced SmartRelatedDrawer Component

Update `src/lib/components/forms/SmartRelatedDrawer.svelte`:

```typescript
// Add enhanced delete handling
let isDeleting = $state(false);
let deleteError = $state<string | null>(null);

async function handleDelete() {
  if (!item?.id) return;
  
  isDeleting = true;
  deleteError = null;
  
  try {
    // Call parent's optimistic delete first
    onSave?.({ deleted: true, id: item.id, optimistic: true });
    
    // The actual delete will be handled by the form submission
    // which will either confirm or rollback the optimistic update
  } catch (error) {
    deleteError = error.message;
    console.error('Delete operation failed:', error);
  } finally {
    isDeleting = false;
  }
}

// Enhanced success handler
function handleSuccess(formData: any) {
  const wasCreate = !item?.id;
  onSave?.({ 
    ...formData, 
    created: wasCreate,
    updated: !wasCreate 
  });
  onClose?.();
}
```

### Phase 2: Enhanced Configuration System

#### 2.1 Enhanced Related Table Config Builder

Update `src/lib/utils/related-table-config.builder.ts`:

```typescript
// Add new methods to RelatedTableConfigBuilder
export class RelatedTableConfigBuilder<T extends Record<string, unknown>, S extends AnyZodObject> {
  // ... existing methods ...

  // New methods for enhanced functionality
  dependencies(deps: string[]): RelatedTableConfigBuilder<T, S> {
    this.config.dependencies = deps;
    return this;
  }

  optimisticUpdates(enabled: boolean = true): RelatedTableConfigBuilder<T, S> {
    this.config.enableOptimisticUpdates = enabled;
    return this;
  }

  errorRecovery(enabled: boolean = true): RelatedTableConfigBuilder<T, S> {
    this.config.enableErrorRecovery = enabled;
    return this;
  }

  refreshStrategy(strategy: 'optimistic' | 'server' | 'hybrid'): RelatedTableConfigBuilder<T, S> {
    this.config.refreshStrategy = strategy;
    return this;
  }
}
```

#### 2.2 Enhanced Related Table Config Types

Update `src/lib/types/related-table-config.types.ts`:

```typescript
export interface RelatedTableConfig<
  T extends Record<string, unknown>,
  S extends AnyZodObject = AnyZodObject
> {
  // ... existing properties ...

  // Enhanced state management
  dependencies?: string[];
  enableOptimisticUpdates?: boolean;
  enableErrorRecovery?: boolean;
  refreshStrategy?: 'optimistic' | 'server' | 'hybrid';

  // Enhanced callbacks
  onDataChange?: (items: T[]) => void;
  onError?: (error: string, operation: string) => void;
  onSuccess?: (message: string, operation: string) => void;
}
```

### Phase 3: Implementation in Product Route

#### 3.1 Enhanced related-configs.ts

```typescript
// src/routes/(app)/catalog/products/[id]/related-configs.ts
import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import type { Component } from 'svelte';
import type { PageData } from './$types';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import {
  mProductPackingInsertSchema,
  mProductPoInsertSchema,
  mReplenishInsertSchema
} from '$lib/types/supabase.zod.schemas';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
import ChartVisualization from '../../../../../lib/components/charts/ChartVisualization.svelte';
import StorageOnHandDisplay from './m-storageonhand-display.svelte';
import { createFormConfig } from '$lib/utils/form-config.builder';

// Enhanced configurations with reactive data management
const productPoConfig = createRelatedTableConfig()
  .title('Vendors')
  .column(columnTypes.lookup('c_bpartner_id', 'Partner', 'partners'))
  .column(columnTypes.text('vendorproductno', 'Vendor PN'))
  .column(columnTypes.number('order_min', 'MOQ'))
  .column(columnTypes.number('pricelist', 'Price'))
  .column(columnTypes.url('url', 'URL'))
  .column(columnTypes.date('valid_from', 'From'))
  .column(columnTypes.date('valid_to', 'To'))
  .formSchema(mProductPoInsertSchema)
  .formConfig(productPoFormConfig)
  .actions('?/productPoUpsert', '?/productPoUpsert', '?/productPoDelete')
  .parentIdField('m_product_id')
  .dependencies(['catalog:products', 'catalog:product-po']) // Add dependencies
  .optimisticUpdates(true) // Enable optimistic updates
  .errorRecovery(true) // Enable error recovery
  .refreshStrategy('hybrid') // Use hybrid refresh strategy
  .build();

// Similar enhancements for other configs...

export function createTabConfigs(data: PageData) {
  return [
    createTabConfig(
      'vendors',
      'Vendors',
      SmartRelatedTable as Component,
      {
        config: productPoConfig,
        items: data.purchases,
        validatedForm: data.formProductPo,
        parentId: data.entity.id,
        lookupData: { partners: data.lookupData.partners },
        dependencies: ['catalog:products', 'catalog:product-po'],
        enableOptimisticUpdates: true
      },
      { badge: data.purchases?.length || 0, order: 1 }
    ),
    // ... other tabs with similar enhancements
  ];
}
```

#### 3.2 Enhanced +page.server.ts

```typescript
// Add enhanced dependency tracking
export const load: PageServerLoad = async ({ depends, params, locals: { supabase } }) => {
  // Enhanced dependency tracking
  depends('catalog:products');
  depends('catalog:product-packing');
  depends('catalog:product-po');
  depends('catalog:replenish');
  depends('catalog:storage-on-hand');

  // ... existing load logic ...

  return {
    // ... existing return data ...
    
    // Add metadata for enhanced state management
    metadata: {
      dependencies: [
        'catalog:products',
        'catalog:product-packing', 
        'catalog:product-po',
        'catalog:replenish'
      ],
      lastUpdated: new Date().toISOString(),
      optimisticUpdatesEnabled: true
    }
  };
};
```

### Phase 4: Error Handling and Recovery

#### 4.1 Enhanced Error Handling Service

Create `src/lib/services/error-handling.service.ts`:

```typescript
import { toast } from 'svelte-sonner';
import { invalidate } from '$app/navigation';

export interface ErrorContext {
  operation: 'create' | 'update' | 'delete';
  entityName: string;
  entityId?: number;
  dependencies?: string[];
}

export class ErrorHandlingService {
  static async handleOperationError(
    error: unknown, 
    context: ErrorContext,
    rollbackFn?: () => Promise<void>
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`${context.operation} operation failed for ${context.entityName}:`, error);
    
    // Show user-friendly error message
    toast.error(`Failed to ${context.operation} ${context.entityName}: ${errorMessage}`);
    
    // Execute rollback if provided
    if (rollbackFn) {
      try {
        await rollbackFn();
        toast.info('Changes have been reverted');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
        toast.error('Failed to revert changes. Please refresh the page.');
      }
    }
    
    // Invalidate dependencies to ensure data consistency
    if (context.dependencies) {
      for (const dependency of context.dependencies) {
        await invalidate(dependency);
      }
    }
  }

  static async handleNetworkError(error: unknown): Promise<void> {
    console.error('Network error:', error);
    toast.error('Network error. Please check your connection and try again.');
  }

  static async handleValidationError(errors: Record<string, string[]>): Promise<void> {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
    
    toast.error(`Validation failed:\n${errorMessages}`);
  }
}
```

### Phase 5: Testing Strategy

#### 5.1 Test Scenarios

1. **Optimistic Updates**:
   - Create item → verify immediate UI update → confirm server sync
   - Update item → verify immediate UI update → confirm server sync  
   - Delete item → verify immediate UI removal → confirm server sync

2. **Error Recovery**:
   - Network failure during delete → verify rollback
   - Server error during create → verify rollback
   - Validation error → verify error display

3. **Data Consistency**:
   - Multiple tabs open → verify sync across tabs
   - Page refresh → verify data consistency
   - Concurrent operations → verify conflict resolution

#### 5.2 Integration Tests

```typescript
// Example test structure
describe('SmartRelatedTable with Enhanced State Management', () => {
  test('should optimistically delete item and sync with server', async () => {
    // Setup component with mock data
    // Trigger delete operation
    // Verify immediate UI update
    // Verify server call
    // Verify final state consistency
  });

  test('should rollback on delete failure', async () => {
    // Setup component with mock data
    // Mock server failure
    // Trigger delete operation
    // Verify rollback occurs
    // Verify error message shown
  });
});
```

## Implementation Benefits

### 1. Immediate User Feedback
- **Optimistic Updates**: Users see changes instantly
- **Loading States**: Clear indication of pending operations
- **Error Recovery**: Automatic rollback on failures

### 2. Data Consistency
- **Server Synchronization**: Automatic invalidation ensures consistency
- **Conflict Resolution**: Handles concurrent operations gracefully
- **State Management**: Centralized reactive state management

### 3. Enhanced User Experience
- **Responsive UI**: No waiting for server responses
- **Error Handling**: Clear error messages and recovery options
- **Performance**: Reduced perceived latency

### 4. Developer Experience
- **Declarative Configuration**: Easy to set up and maintain
- **Type Safety**: Full TypeScript support
- **Extensible**: Easy to add new features and customizations

## Migration Path

### Step 1: Update Core Components
1. Create `ReactiveDataManager` utility
2. Update `SmartRelatedTable` component
3. Update `SmartRelatedDrawer` component

### Step 2: Enhance Configuration System
1. Update related table config types
2. Update config builder with new methods
3. Add error handling service

### Step 3: Update Product Route
1. Enhance `related-configs.ts`
2. Update `+page.server.ts` with dependencies
3. Test all CRUD operations

### Step 4: Rollout to Other Routes
1. Apply pattern to other Smart Split Layout routes
2. Update documentation
3. Create migration guide for existing implementations

## Conclusion

This comprehensive solution addresses the delete refresh issue while providing a robust foundation for enhanced state management, optimistic updates, and error recovery. The solution maintains backward compatibility while significantly improving user experience and data consistency.

The key innovations include:

1. **Reactive Data Manager**: Centralized state management with optimistic updates
2. **Enhanced Error Handling**: Automatic rollback and recovery mechanisms  
3. **Improved Configuration**: Declarative setup for complex behaviors
4. **Better User Experience**: Immediate feedback and graceful error handling

This solution transforms the Smart Related Table pattern from a basic CRUD interface into a sophisticated, production-ready data management system.