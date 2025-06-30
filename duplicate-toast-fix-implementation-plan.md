# Duplicate Toast Fix Implementation Plan

## Overview
This document outlines the complete implementation plan to fix duplicate toast issues across all Smart patterns in the RooCode project.

## Problem Analysis

### Identified Duplicate Toast Scenarios

1. **Smart CRUD Factory + SmartForm**: Both server and client show error toasts
2. **List Page Factory + Custom Pages**: Double toasting on delete operations  
3. **SmartRelatedTable + SmartForm**: Potential conflicts in drawer operations
4. **SmartSplitLayout Chain**: Triple toast potential through SmartRelatedDrawer → SmartForm → Parent
5. **Custom Pages**: Manual toast handling conflicts with pattern toasts

## Implementation Steps

### Phase 1: Create Centralized ToastManager

**File**: `src/lib/utils/toast-manager.ts`

```typescript
import { toast } from 'svelte-sonner';

export interface ToastOptions {
  dedupeKey?: string;
  duration?: number;
  context?: ErrorContext;
  showRetry?: boolean;
  onRetry?: () => void;
}

export interface ErrorContext {
  type: 'validation' | 'server' | 'network' | 'permission' | 'configuration';
  operation: 'create' | 'update' | 'delete' | 'read';
  entity: string;
  field?: string;
  code?: string;
}

export class ToastManager {
  private static instance: ToastManager;
  private activeToasts = new Set<string>();
  private toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  
  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }
  
  showToast(
    type: 'success' | 'error' | 'info' | 'warning', 
    message: string, 
    options: ToastOptions = {}
  ) {
    const key = options.dedupeKey || `${type}-${message.slice(0, 50)}`;
    
    // Prevent duplicate toasts
    if (this.activeToasts.has(key)) {
      return;
    }
    
    this.activeToasts.add(key);
    
    // Clear any existing timeout for this key
    const existingTimeout = this.toastTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Show the toast
    const toastId = toast[type](message, {
      duration: options.duration || 4000,
      action: options.showRetry ? {
        label: 'Retry',
        onClick: options.onRetry || (() => {})
      } : undefined
    });
    
    // Set cleanup timeout
    const timeout = setTimeout(() => {
      this.activeToasts.delete(key);
      this.toastTimeouts.delete(key);
    }, options.duration || 4000);
    
    this.toastTimeouts.set(key, timeout);
    
    return toastId;
  }
  
  showSuccess(message: string, options: Omit<ToastOptions, 'context'> = {}) {
    return this.showToast('success', message, options);
  }
  
  showError(message: string, options: Omit<ToastOptions, 'context'> = {}) {
    return this.showToast('error', message, options);
  }
  
  showErrorWithContext(
    message: string, 
    context: ErrorContext, 
    options: Omit<ToastOptions, 'context'> = {}
  ) {
    const contextualMessage = this.buildContextualMessage(message, context);
    const dedupeKey = options.dedupeKey || this.generateContextualKey(context, message);
    
    return this.showToast('error', contextualMessage, {
      ...options,
      dedupeKey,
      context
    });
  }
  
  private buildContextualMessage(message: string, context: ErrorContext): string {
    const { operation, entity, type } = context;
    
    switch (type) {
      case 'validation':
        return `Validation error while ${this.getOperationText(operation)} ${entity}: ${message}`;
      case 'permission':
        return `You don't have permission to ${operation} ${entity}`;
      case 'network':
        return `Network error while ${this.getOperationText(operation)} ${entity}. Please check your connection.`;
      case 'server':
        return `Server error while ${this.getOperationText(operation)} ${entity}: ${message}`;
      default:
        return message;
    }
  }
  
  private getOperationText(operation: string): string {
    switch (operation) {
      case 'create': return 'creating';
      case 'update': return 'updating';
      case 'delete': return 'deleting';
      case 'read': return 'loading';
      default: return 'processing';
    }
  }
  
  private generateContextualKey(context: ErrorContext, message: string): string {
    return `${context.entity}-${context.operation}-${context.type}-${message.slice(0, 20)}`;
  }
  
  clearAll() {
    this.activeToasts.clear();
    this.toastTimeouts.forEach(timeout => clearTimeout(timeout));
    this.toastTimeouts.clear();
  }
  
  destroy() {
    this.clearAll();
  }
}

// Export singleton instance for convenience
export const toastManager = ToastManager.getInstance();
```

### Phase 2: Update Smart CRUD Factory

**File**: `src/lib/utils/simple-crud.factory.ts`

**Changes**:
1. Remove `message()` calls that create server-side toasts
2. Return structured success/error data for client handling
3. Let client components handle all user feedback

```typescript
// Key changes in upsert action:
try {
  if (isUpdate) {
    const updatedEntity = await service.update(Number(id), payload);
    Object.assign(form.data, updatedEntity);
    // Return success data without message - let client handle toast
    return { form, success: true, entity: updatedEntity, operation: 'update' };
  } else {
    const createdEntity = await service.create(payload);
    Object.assign(form.data, createdEntity);
    return { form, success: true, entity: createdEntity, operation: 'create' };
  }
} catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  // Return error data without message - let client handle toast
  return fail(400, { 
    form, 
    error: errorMessage,
    errorType: 'validation',
    operation: isUpdate ? 'update' : 'create'
  });
}

// Similar changes for delete action
```

### Phase 3: Update SmartForm Component

**File**: `src/lib/components/forms/SmartForm.svelte`

**Changes**:
1. Import and use ToastManager
2. Update onResult callback to use centralized toast management
3. Add deduplication keys based on entity and operation

```typescript
import { toastManager } from '$lib/utils/toast-manager';

const superform = superForm(initialForm, {
  // ... existing config ...
  onResult: ({ result }) => {
    if (result.type === 'success') {
      if (result.data?.success) {
        const operation = result.data.operation || 'save';
        const message = operation === 'create' 
          ? `${entityName} created successfully!`
          : `${entityName} updated successfully!`;
          
        toastManager.showSuccess(message, {
          dedupeKey: `${entityName.toLowerCase()}-${operation}-success`
        });
        
        if (onSuccess) onSuccess($formData as FormDataFromSchema<AnyZodObject>);
      }
    } else if (result.type === 'failure') {
      const errorMessage = result.data?.error || `Failed to save ${entityName.toLowerCase()}`;
      const operation = result.data?.operation || 'save';
      
      toastManager.showError(errorMessage, {
        dedupeKey: `${entityName.toLowerCase()}-${operation}-error-${errorMessage.slice(0, 20)}`
      });
      
      if (onError) onError(errorMessage, superform);
    } else if (result.type === 'error') {
      toastManager.showError(
        `An unexpected error occurred while saving ${entityName.toLowerCase()}`,
        { dedupeKey: `${entityName.toLowerCase()}-unexpected-error` }
      );
      
      if (onError) onError(result.error?.message || null, superform);
    }
  }
});
```

### Phase 4: Update List Page Factory

**File**: `src/lib/utils/list-page.factory.ts`

**Changes**:
1. Remove server-side error messages
2. Return structured error data for client handling

```typescript
const actions = {
  delete: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, zod4(deleteByIdSchema));
    if (!form.valid) return fail(400, { form });

    const serviceInstance = new Service(supabase);
    if ('delete' in serviceInstance && typeof serviceInstance.delete === 'function') {
      try {
        await serviceInstance.delete(Number(form.data.id));
        return { form, success: true, operation: 'delete' };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        return fail(500, { 
          form, 
          error: message,
          errorType: 'server',
          operation: 'delete'
        });
      }
    } else {
      return fail(500, { 
        form, 
        error: 'Delete method not available on service.',
        errorType: 'configuration',
        operation: 'delete'
      });
    }
  }
};
```

### Phase 5: Update SmartTable Component

**File**: `src/lib/components/forms/SmartTable.svelte`

**Changes**:
1. Import ToastManager
2. Update delete form handling to use centralized toasts

```typescript
import { toastManager } from '$lib/utils/toast-manager';

const { form: deleteSuperForm, enhance: deleteEnhance } = superForm(deleteForm, {
  resetForm: true,
  onResult: ({ result }) => {
    if (result.type === 'success') {
      if (result.data?.success) {
        deleteDialogOpen = false;
        toastManager.showSuccess('Item deleted successfully', {
          dedupeKey: 'table-delete-success'
        });
        // Reload data to reflect changes
        invalidate('crm:contacts'); // Update with appropriate dependency
      }
    } else if (result.type === 'failure') {
      const errorMessage = result.data?.error || 'Failed to delete item';
      toastManager.showError(errorMessage, {
        dedupeKey: `table-delete-error-${errorMessage.slice(0, 20)}`
      });
    }
  }
});
```

### Phase 6: Update SmartRelatedTable Component

**File**: `src/lib/components/forms/SmartRelatedTable.svelte`

**Changes**:
1. Remove any duplicate toast handling
2. Ensure only data refresh happens, not additional toasts

```typescript
function handleSave(result?: any) {
  // Reset selected item after save
  selectedItemId = undefined;

  // Only refresh data - SmartForm in drawer already handled user feedback
  onRefresh?.();
}
```

### Phase 7: Update SmartRelatedDrawer Component

**File**: `src/lib/components/forms/SmartRelatedDrawer.svelte`

**Changes**:
1. Remove duplicate toast handling
2. Let SmartForm handle all user feedback

```typescript
// Event handlers - simplified to avoid duplicate toasts
function handleSuccess(formData: any) {
  // SmartForm already handled the success toast
  onSave?.(formData);
  onClose?.();
}

function handleError(error: string | null) {
  // SmartForm already handled the error toast
  console.error(`Failed to ${isCreateMode ? 'create' : 'update'} ${config.title}:`, error);
}

function handleDelete() {
  // SmartForm already handled the delete toast
  onSave?.({ deleted: true, id: item?.id });
  onClose?.();
}
```

### Phase 8: Update Custom Pages

**File**: `src/routes/(app)/crm/pricing-rules/+page.svelte`

**Changes**:
1. Import ToastManager
2. Update all manual toast calls to use centralized manager

```typescript
import { toastManager } from '$lib/utils/toast-manager';

const createForm = superForm(
  { name: '' },
  {
    validators: zodClient(createSchema),
    onResult: ({ result }) => {
      if (result.type === 'success' && result.data?.ruleId) {
        createDialogOpen = false;
        toastManager.showSuccess('Pravilo je uspešno kreirano', {
          dedupeKey: 'pricing-rule-create-success'
        });
        goto(`/crm/pricing-rules/${result.data.ruleId}`);
      } else if (result.type === 'failure') {
        const errorMessage = result.data?.error || 'Greška pri kreiranju pravila.';
        toastManager.showError(errorMessage, {
          dedupeKey: `pricing-rule-create-error-${errorMessage.slice(0, 20)}`
        });
      }
    },
    onError: ({ result }) => {
      toastManager.showError(
        result.error.message || 'Nepoznata greška prilikom kreiranja.',
        { dedupeKey: 'pricing-rule-unexpected-error' }
      );
    }
  }
);

// Update swap priorities handler
const handleSubmitSwapPriorities: import('@sveltejs/kit').SubmitFunction = async () => {
  return async ({ result, update }) => {
    if (result.type === 'success') {
      toastManager.showSuccess('Prioritet je uspešno promenjen.', {
        dedupeKey: 'priority-swap-success'
      });
    } else if (result.type === 'failure') {
      const errorMessage = result.data?.error || 'Greška pri promeni prioriteta.';
      toastManager.showError(errorMessage, {
        dedupeKey: `priority-swap-error-${errorMessage.slice(0, 20)}`
      });
    } else if (result.type === 'error') {
      toastManager.showError(
        result.error.message || 'Nepoznata greška prilikom promene prioriteta.',
        { dedupeKey: 'priority-swap-unexpected-error' }
      );
    }
    await update({ reset: false });
  };
};
```

## Testing Strategy

### Test Scenarios
1. **Create Entity**: Verify single success toast
2. **Create Entity with Validation Error**: Verify single error toast  
3. **Create Entity with Server Error**: Verify single error toast
4. **Delete from List**: Verify single success/error toast
5. **Rapid Operations**: Verify no duplicate toasts
6. **Split Layout Operations**: Verify single toast through entire chain
7. **Network Failures**: Verify appropriate error handling

### Implementation Order
1. Create ToastManager utility
2. Update Smart CRUD factory and SmartForm
3. Update List Page factory and SmartTable  
4. Update Smart Related components
5. Update custom pages
6. Test all scenarios
7. Add enhanced error context features

## Migration Notes

- All changes are backward compatible
- Existing toast calls will continue to work
- Gradual migration possible - can update patterns one by one
- No breaking changes to component APIs
- Enhanced error context is optional feature

## Benefits

1. **Eliminates Duplicate Toasts**: Single toast per operation across all patterns
2. **Consistent UX**: Unified toast behavior across entire application
3. **Better Error Context**: Enhanced error messages with operation context
4. **Centralized Management**: Single point of control for all user feedback
5. **Performance**: Reduced DOM manipulation from duplicate toasts
6. **Maintainability**: Easier to modify toast behavior globally