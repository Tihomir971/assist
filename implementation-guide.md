# Smart Related Table Refresh - Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the complete solution to fix the delete refresh issue in Smart Related Tables, including optimistic updates, error handling, and enhanced state management.

## Prerequisites

- SvelteKit application with existing Smart patterns
- Supabase integration
- TypeScript configuration
- Existing Smart Related Table components

## Implementation Steps

### Step 1: Create Core Utilities

#### 1.1 Create Reactive Data Manager

**File**: `src/lib/utils/reactive-data-manager.ts`

```typescript
import { invalidate } from '$app/navigation';
import { writable, derived, type Writable } from 'svelte/store';
import { toast } from 'svelte-sonner';

export interface DataOperation<T> {
  type: 'create' | 'update' | 'delete';
  id?: number;
  data?: T;
  optimistic?: boolean;
  timestamp: number;
}

export interface DataManagerConfig {
  dependencies: string[];
  entityName: string;
  enableOptimisticUpdates: boolean;
  enableErrorRecovery: boolean;
  debugMode?: boolean;
}

export class ReactiveDataManager<T extends { id: number }> {
  private _items: Writable<T[]>;
  private _loading: Writable<boolean>;
  private _error: Writable<string | null>;
  private _pendingOperations: Writable<Map<number, DataOperation<T>>>;
  private _originalItems: T[] = []; // For rollback purposes
  
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
    this._originalItems = [...initialItems];

    // Create derived stores for external consumption
    this.items = derived(this._items, ($items) => $items);
    this.loading = derived(this._loading, ($loading) => $loading);
    this.error = derived(this._error, ($error) => $error);
    this.pendingOperations = derived(this._pendingOperations, ($pending) => $pending);

    if (this.config.debugMode) {
      console.log(`ReactiveDataManager initialized for ${this.config.entityName}`, {
        initialCount: initialItems.length,
        config: this.config
      });
    }
  }

  // Optimistic create operation
  async optimisticCreate(tempItem: T): Promise<void> {
    if (!this.config.enableOptimisticUpdates) return;

    this._items.update(items => [...items, tempItem]);
    this._pendingOperations.update(pending => {
      pending.set(tempItem.id, { 
        type: 'create', 
        data: tempItem, 
        optimistic: true,
        timestamp: Date.now()
      });
      return pending;
    });

    if (this.config.debugMode) {
      console.log(`Optimistic create for ${this.config.entityName}:`, tempItem);
    }
  }

  // Optimistic update operation
  async optimisticUpdate(id: number, updates: Partial<T>): Promise<void> {
    if (!this.config.enableOptimisticUpdates) return;

    // Store original item for rollback
    const originalItem = this.getCurrentItems().find(item => item.id === id);
    if (!originalItem) return;

    this._items.update(items => 
      items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
    
    this._pendingOperations.update(pending => {
      pending.set(id, { 
        type: 'update', 
        id, 
        data: { ...originalItem, ...updates } as T, 
        optimistic: true,
        timestamp: Date.now()
      });
      return pending;
    });

    if (this.config.debugMode) {
      console.log(`Optimistic update for ${this.config.entityName}:`, { id, updates });
    }
  }

  // Optimistic delete operation
  async optimisticDelete(id: number): Promise<void> {
    if (!this.config.enableOptimisticUpdates) return;

    // Store the item for potential rollback
    const itemToDelete = this.getCurrentItems().find(item => item.id === id);
    if (!itemToDelete) return;

    this._items.update(items => items.filter(item => item.id !== id));
    this._pendingOperations.update(pending => {
      pending.set(id, { 
        type: 'delete', 
        id, 
        data: itemToDelete, 
        optimistic: true,
        timestamp: Date.now()
      });
      return pending;
    });

    if (this.config.debugMode) {
      console.log(`Optimistic delete for ${this.config.entityName}:`, { id, item: itemToDelete });
    }
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

    // Clear any errors
    this._error.set(null);

    // Invalidate dependencies to ensure server sync
    await this.invalidateData();

    if (this.config.debugMode) {
      console.log(`Operation confirmed for ${this.config.entityName}:`, { id, result });
    }
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
            // Find original item and restore it
            const originalItem = this._originalItems.find(item => item.id === id);
            if (originalItem) {
              this._items.update(items => 
                items.map(item => item.id === id ? originalItem : item)
              );
            }
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

    if (this.config.debugMode) {
      console.error(`Operation rollback for ${this.config.entityName}:`, { id, error });
    }
  }

  // Force refresh from server
  async invalidateData(): Promise<void> {
    this._loading.set(true);
    try {
      for (const dependency of this.config.dependencies) {
        await invalidate(dependency);
      }
    } catch (error) {
      console.error('Failed to invalidate data:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Update items from server (called by parent component)
  updateItems(newItems: T[]): void {
    this._items.set(newItems);
    this._originalItems = [...newItems];
    this._error.set(null);

    if (this.config.debugMode) {
      console.log(`Items updated for ${this.config.entityName}:`, { count: newItems.length });
    }
  }

  // Get current items (for internal use)
  private getCurrentItems(): T[] {
    let currentItems: T[] = [];
    this.items.subscribe(items => currentItems = items)();
    return currentItems;
  }

  // Cleanup method
  destroy(): void {
    this._pendingOperations.update(pending => {
      pending.clear();
      return pending;
    });
  }
}
```

#### 1.2 Create Error Handling Service

**File**: `src/lib/services/error-handling.service.ts`

```typescript
import { toast } from 'svelte-sonner';
import { invalidate } from '$app/navigation';

export interface ErrorContext {
  operation: 'create' | 'update' | 'delete';
  entityName: string;
  entityId?: number;
  dependencies?: string[];
  userMessage?: string;
}

export interface ValidationError {
  field: string;
  messages: string[];
}

export class ErrorHandlingService {
  static async handleOperationError(
    error: unknown, 
    context: ErrorContext,
    rollbackFn?: () => Promise<void>
  ): Promise<void> {
    const errorMessage = this.extractErrorMessage(error);
    
    console.error(`${context.operation} operation failed for ${context.entityName}:`, {
      error,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Show user-friendly error message
    const userMessage = context.userMessage || 
      `Failed to ${context.operation} ${context.entityName}: ${errorMessage}`;
    toast.error(userMessage);
    
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
      await this.invalidateDependencies(context.dependencies);
    }
  }

  static async handleNetworkError(error: unknown): Promise<void> {
    console.error('Network error:', error);
    toast.error('Network error. Please check your connection and try again.');
  }

  static async handleValidationError(errors: ValidationError[]): Promise<void> {
    const errorMessages = errors
      .map(({ field, messages }) => `${field}: ${messages.join(', ')}`)
      .join('\n');
    
    toast.error(`Validation failed:\n${errorMessages}`);
  }

  static async handleServerError(error: unknown, context?: Partial<ErrorContext>): Promise<void> {
    const errorMessage = this.extractErrorMessage(error);
    console.error('Server error:', { error, context });
    
    toast.error(`Server error: ${errorMessage}`);
    
    if (context?.dependencies) {
      await this.invalidateDependencies(context.dependencies);
    }
  }

  private static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'An unknown error occurred';
  }

  private static async invalidateDependencies(dependencies: string[]): Promise<void> {
    try {
      for (const dependency of dependencies) {
        await invalidate(dependency);
      }
    } catch (invalidateError) {
      console.error('Failed to invalidate dependencies:', invalidateError);
    }
  }
}
```

### Step 2: Update Core Components

#### 2.1 Enhanced SmartRelatedTable Component

**File**: `src/lib/components/forms/SmartRelatedTable.svelte`

Add these imports and enhancements:

```typescript
// Add to existing imports
import { ReactiveDataManager, type DataManagerConfig } from '$lib/utils/reactive-data-manager';
import { ErrorHandlingService } from '$lib/services/error-handling.service';
import { invalidate } from '$app/navigation';
import { onMount, onDestroy } from 'svelte';

// Enhanced props interface
interface SmartRelatedTableProps<T extends Record<string, any>, S extends AnyZodObject> {
  config: RelatedTableConfig<T, S>;
  items: T[];
  validatedForm: SuperValidated<z.infer<S>>;
  parentId: number | undefined;
  lookupData?: Record<string, Array<{ value: any; label: string }>>;
  dependencies?: string[]; // Data dependencies for invalidation
  enableOptimisticUpdates?: boolean;
  debugMode?: boolean;
  onRefresh?: () => void;
  onBulkAction?: (action: string, selectedIds: number[]) => void;
  onError?: (error: string, context: any) => void;
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
  debugMode = false,
  onRefresh,
  onBulkAction,
  onError
}: SmartRelatedTableProps<any, any> = $props();

// Create reactive data manager
let dataManager: ReactiveDataManager<any> | null = null;

onMount(() => {
  const dataManagerConfig: DataManagerConfig = {
    dependencies,
    entityName: config.title,
    enableOptimisticUpdates,
    enableErrorRecovery: true,
    debugMode
  };

  dataManager = new ReactiveDataManager(initialItems, dataManagerConfig);
});

onDestroy(() => {
  dataManager?.destroy();
});

// Update data manager when items change from parent
$effect(() => {
  if (dataManager && initialItems) {
    dataManager.updateItems(initialItems);
  }
});

// Use reactive data from manager
let items = $derived(dataManager ? $dataManager.items : initialItems);
let isLoading = $derived(dataManager ? $dataManager.loading : false);
let error = $derived(dataManager ? $dataManager.error : null);
let pendingOperations = $derived(dataManager ? $dataManager.pendingOperations : new Map());

// Enhanced event handlers
async function handleSave(result?: any) {
  selectedItemId = undefined;
  
  if (!dataManager) {
    // Fallback to simple refresh
    onRefresh?.();
    return;
  }

  try {
    if (result?.deleted && result?.id) {
      // Confirm optimistic delete
      await dataManager.confirmOperation(result.id);
      toast.success(`${config.title} deleted successfully`);
    } else if (result?.id) {
      // Confirm create/update
      await dataManager.confirmOperation(result.id, result);
      const action = result.created ? 'created' : 'updated';
      toast.success(`${config.title} ${action} successfully`);
    } else {
      // Generic success - just refresh
      await dataManager.invalidateData();
    }
  } catch (error) {
    console.error('Failed to confirm operation:', error);
    if (result?.id) {
      await dataManager.rollbackOperation(result.id, error.message);
    }
    
    // Call error handler if provided
    onError?.(error.message, { operation: 'save', result });
  }

  // Always call parent refresh
  onRefresh?.();
}

async function handleOptimisticDelete(itemId: number) {
  if (!dataManager || !enableOptimisticUpdates) return;
  
  try {
    await dataManager.optimisticDelete(itemId);
  } catch (error) {
    console.error('Optimistic delete failed:', error);
    await ErrorHandlingService.handleOperationError(error, {
      operation: 'delete',
      entityName: config.title,
      entityId: itemId,
      dependencies
    });
  }
}

// Enhanced edit handler with optimistic updates
function handleEdit(itemId: number) {
  selectedItemId = itemId;
  isDrawerOpen = true;
}

// Add method to handle pre-delete (for optimistic updates)
function handlePreDelete(itemId: number) {
  if (enableOptimisticUpdates) {
    handleOptimisticDelete(itemId);
  }
}
```

Add loading and error states to the UI:

```svelte
<!-- Add loading overlay -->
{#if isLoading}
  <div class="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
    <div class="flex items-center gap-2">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      <span class="text-sm text-muted-foreground">Updating...</span>
    </div>
  </div>
{/if}

<!-- Add error display -->
{#if error}
  <div class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
    <div class="flex items-center gap-2">
      <span class="text-sm text-destructive">{error}</span>
      <Button 
        variant="ghost" 
        size="sm" 
        onclick={() => dataManager?.invalidateData()}
      >
        Retry
      </Button>
    </div>
  </div>
{/if}

<!-- Add pending operation indicators -->
{#each paginatedItems as row (row.id)}
  <Table.Row class={pendingOperations.has(row.id) ? 'opacity-50' : ''}>
    <!-- existing row content -->
    
    {#if pendingOperations.has(row.id)}
      <Table.Cell>
        <div class="flex items-center gap-1">
          <div class="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
          <span class="text-xs text-muted-foreground">
            {pendingOperations.get(row.id)?.type}...
          </span>
        </div>
      </Table.Cell>
    {/if}
  </Table.Row>
{/each}
```

#### 2.2 Enhanced SmartRelatedDrawer Component

**File**: `src/lib/components/forms/SmartRelatedDrawer.svelte`

Add these enhancements:

```typescript
// Add to existing imports
import { ErrorHandlingService } from '$lib/services/error-handling.service';

// Add state for enhanced delete handling
let isDeleting = $state(false);
let deleteError = $state<string | null>(null);
let operationInProgress = $state(false);

// Enhanced delete handler
async function handleDelete() {
  if (!item?.id || isDeleting) return;
  
  isDeleting = true;
  deleteError = null;
  operationInProgress = true;
  
  try {
    // Notify parent about optimistic delete
    onSave?.({ 
      deleted: true, 
      id: item.id, 
      optimistic: true,
      timestamp: Date.now()
    });
    
    // The actual delete will be handled by the form submission
    // which will either confirm or rollback the optimistic update
    
  } catch (error) {
    deleteError = error.message;
    console.error('Delete operation failed:', error);
    
    await ErrorHandlingService.handleOperationError(error, {
      operation: 'delete',
      entityName: config.title,
      entityId: item.id
    });
  } finally {
    isDeleting = false;
    operationInProgress = false;
  }
}

// Enhanced success handler
function handleSuccess(formData: any) {
  const wasCreate = !item?.id;
  const result = { 
    ...formData, 
    created: wasCreate,
    updated: !wasCreate,
    timestamp: Date.now()
  };
  
  onSave?.(result);
  onClose?.();
}

// Enhanced error handler
function handleError(error: string | null) {
  console.error(`Failed to ${isCreateMode ? 'create' : 'update'} ${config.title}:`, error);
  
  if (error) {
    ErrorHandlingService.handleOperationError(new Error(error), {
      operation: isCreateMode ? 'create' : 'update',
      entityName: config.title,
      entityId: item?.id
    });
  }
}
```

Add enhanced UI elements:

```svelte
<!-- Add operation status indicators -->
{#if operationInProgress}
  <div class="mb-4 p-3 bg-muted rounded-md">
    <div class="flex items-center gap-2">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      <span class="text-sm">Operation in progress...</span>
    </div>
  </div>
{/if}

{#if deleteError}
  <div class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
    <span class="text-sm text-destructive">{deleteError}</span>
  </div>
{/if}
```

### Step 3: Update Configuration System

#### 3.1 Enhanced Related Table Config Types

**File**: `src/lib/types/related-table-config.types.ts`

Add these properties to the `RelatedTableConfig` interface:

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
  debugMode?: boolean;

  // Enhanced callbacks
  onDataChange?: (items: T[]) => void;
  onError?: (error: string, operation: string) => void;
  onSuccess?: (message: string, operation: string) => void;
  
  // Performance options
  enableVirtualization?: boolean;
  batchSize?: number;
}
```

#### 3.2 Enhanced Related Table Config Builder

**File**: `src/lib/utils/related-table-config.builder.ts`

Add these methods to the builder:

```typescript
export class RelatedTableConfigBuilder<T extends Record<string, unknown>, S extends AnyZodObject> {
  // ... existing methods ...

  // Enhanced state management methods
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

  debugMode(enabled: boolean = true): RelatedTableConfigBuilder<T, S> {
    this.config.debugMode = enabled;
    return this;
  }

  // Callback methods
  onDataChange(callback: (items: T[]) => void): RelatedTableConfigBuilder<T, S> {
    this.config.onDataChange = callback;
    return this;
  }

  onError(callback: (error: string, operation: string) => void): RelatedTableConfigBuilder<T, S> {
    this.config.onError = callback;
    return this;
  }

  onSuccess(callback: (message: string, operation: string) => void): RelatedTableConfigBuilder<T, S> {
    this.config.onSuccess = callback;
    return this;
  }

  // Performance methods
  virtualization(enabled: boolean = true, batchSize: number = 50): RelatedTableConfigBuilder<T, S> {
    this.config.enableVirtualization = enabled;
    this.config.batchSize = batchSize;
    return this;
  }
}
```

### Step 4: Update Product Route Implementation

#### 4.1 Enhanced related-configs.ts

**File**: `src/routes/(app)/catalog/products/[id]/related-configs.ts`

```typescript
// Add enhanced configurations
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
  // Enhanced configuration
  .dependencies(['catalog:products', 'catalog:product-po'])
  .optimisticUpdates(true)
  .errorRecovery(true)
  .refreshStrategy('hybrid')
  .debugMode(false) // Set to true for development
  .onError((error, operation) => {
    console.error(`Product PO ${operation} error:`, error);
  })
  .onSuccess((message, operation) => {
    console.log(`Product PO ${operation} success:`, message);
  })
  .build();

// Similar enhancements for other configs...
const productPackingConfig = createRelatedTableConfig()
  .title('Barcodes')
  .column(columnTypes.text('packing_type', 'Package'))
  .column(columnTypes.number('unitsperpack', 'Qty'))
  .column(columnTypes.text('gtin', 'Barcode'))
  .column(columnTypes.boolean('is_display', 'Display'))
  .formSchema(mProductPackingInsertSchema)
  .formConfig(productPackingFormConfig)
  .actions('?/productPackingUpsert', '?/productPackingUpsert', '?/productPackingDelete')
  .parentIdField('m_product_id')
  .dependencies(['catalog:products', 'catalog:product-packing'])
  .optimisticUpdates(true)
  .errorRecovery(true)
  .refreshStrategy('hybrid')
  .build();

const replenishConfig = createRelatedTableConfig()
  .title('Replenishment')
  .column(columnTypes.lookup('m_warehouse_id', 'Warehouse', 'warehouses'))
  .column(columnTypes.lookup('m_warehousesource_id', 'Source', 'warehouses'))
  .column(columnTypes.number('level_min', 'Min Level'))
  .column(columnTypes.number('level_max', 'Max Level'))
  .column(columnTypes.number('qtybatchsize', 'Batch Size'))
  .formSchema(mReplenishInsertSchema)
  .formConfig(replenishFormConfig)
  .actions('?/replenishUpsert', '?/replenishUpsert', '?/replenishDelete')
  .parentIdField('m_product_id')
  .dependencies(['catalog:products', 'catalog:replenish'])
  .optimisticUpdates(true)
  .errorRecovery(true)
  .refreshStrategy('hybrid')
  .build();

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
        enableOptimisticUpdates: true,
        debugMode: false
      },
      { badge: data.purchases?.length || 0, order: 1 }
    ),
    createTabConfig(
      'packing',
      'Barcodes',
      SmartRelatedTable as Component,
      {
        config: productPackingConfig,
        items: data.productPacking,
        validatedForm: data.formProductPacking,
        parentId: data.entity.id,
        dependencies: ['catalog:products', 'catalog:product-packing'],
        enableOptimisticUpdates: true
      },
      { badge: data.productPacking?.length || 0, order: 2 }
    ),
    createTabConfig(
      'replenish',
      'Replenish',
      SmartRelatedTable as Component,
      {
        config: replenishConfig,
        items: data.replenishes,
        validatedForm: data.formReplenish,
        parentId: data.entity.id,
        lookupData: { warehouses: data.lookupData.warehouses },
        dependencies: ['catalog:products', 'catalog:replenish'],
        enableOptimisticUpdates: true
      },
      { badge: data.replenishes?.length || 0, order: 4 }
    ),
    // Keep existing tabs (stock, sales-chart) unchanged
    createTabConfig(
      'stock',
      'Stock',
      StorageOnHandDisplay as Component,
      {
        storageOnHand: data.storageonhand,
        warehouses: data.lookupData.warehouses
      },
      { order: 3 }
    ),
    createTabConfig(
      'sales-chart',
      'Sales Chart',
      ChartVisualization as Component,
      {
        data: data.salesByWeeks
      },
      { order: 5 }
    )
  ];
}
```

#### 4.2 Enhanced +page.server.ts

**File**: `src/routes/(app)/catalog/products/[id]/+page.server.ts`

Add enhanced dependency tracking:

```typescript
export const load: PageServerLoad = async ({ depends, params, locals: { supabase } }) => {
  // Enhanced dependency tracking with specific keys
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
        'catalog:replenish',
        'catalog:storage-on-hand'
      ],
      lastUpdated: new Date().toISOString(),
      optimisticUpdatesEnabled: true,
      productId: productId
    }
  };
};
```

### Step 5: Testing and Validation

#### 5.1 Create Test Utilities

**File**: `src/lib/utils/test-helpers.ts`

```typescript
import { ReactiveDataManager, type DataManagerConfig } from './reactive-data-manager';

export interface TestItem {
  id: number;
  name: string;
  value: number;
}

export function createTestDataManager(
  items: TestItem[] = [],
  config: Partial<DataManagerConfig> = {}
): ReactiveDataManager<TestItem> {
  const defaultConfig: DataManagerConfig = {
    