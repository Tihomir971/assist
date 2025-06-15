# Enhanced Form Handling - Phase 2B

This directory contains the advanced form state management and validation systems for Phase 2B of the Enhanced Form Handling implementation.

## Overview

The enhanced form handling system provides:

1. **Enhanced Form State Management** - Reactive state with dirty tracking, auto-save, and validation coordination
2. **Real-time Validation Engine** - Debounced validation with field-level and cross-field validation
3. **Schema-Based Validation Integration** - Automatic validation rules from Zod schemas with custom messages
4. **Integrated Form Management** - Unified API that coordinates all systems

## Components

### 1. Enhanced Form State Manager (`enhanced-form-state.svelte.ts`)

Provides reactive form state management using Svelte 5 runes:

```typescript
import { createEnhancedFormState } from '$lib/stores/enhanced-form-state.svelte';

const formState = createEnhancedFormState({
  schema: myZodSchema,
  initialData: { name: '', email: '' },
  autoSave: {
    enabled: true,
    debounceMs: 2000,
    onAutoSave: async (data) => {
      await saveToServer(data);
    }
  },
  validateOnChange: true,
  validateOnBlur: true
});

// Access reactive state
$: isDirty = formState.isDirty;
$: isValid = formState.isValid;
$: hasUnsavedChanges = formState.hasUnsavedChanges;
```

### 2. Real-time Validator (`real-time-validator.ts`)

Handles debounced validation with caching and cross-field validation:

```typescript
import { createRealTimeValidator, createCrossFieldRules } from '$lib/validation/real-time-validator';

const validator = createRealTimeValidator({
  schema: myZodSchema,
  debounceMs: 300,
  enableCaching: true,
  crossFieldRules: [
    createCrossFieldRules.fieldMatch('password', 'confirmPassword', 'Passwords must match'),
    createCrossFieldRules.conditionalRequired('phone', 'contactMethod', 'phone')
  ],
  asyncRules: {
    email: {
      name: 'email_unique',
      validator: async (value) => {
        const exists = await checkEmailExists(value);
        return {
          isValid: !exists,
          errors: exists ? ['Email already exists'] : [],
          fieldName: 'email',
          timestamp: new Date()
        };
      },
      debounceMs: 500
    }
  }
});

// Validate field
const result = await validator.validateField('email', 'user@example.com', formData);
```

### 3. Schema Validator (`schema-validator.ts`)

Extracts validation rules from Zod schemas with internationalization support:

```typescript
import { createSchemaValidator } from '$lib/validation/schema-validator';

const schemaValidator = createSchemaValidator({
  schema: myZodSchema,
  customMessages: {
    email: {
      required: 'Email address is required',
      email: 'Please enter a valid email address'
    }
  },
  i18nMessages: {
    es: {
      email: {
        required: 'La dirección de correo electrónico es obligatoria',
        email: 'Por favor ingrese una dirección de correo electrónico válida'
      }
    }
  },
  currentLocale: 'en'
});

// Validate entire form
const result = await schemaValidator.validateForm(formData);
```

### 4. Enhanced Form Integration (`enhanced-form-integration.ts`)

Unified API that coordinates all systems:

```typescript
import { createEnhancedFormIntegration } from '$lib/validation/enhanced-form-integration';

const formIntegration = createEnhancedFormIntegration({
  schema: myZodSchema,
  initialData: { name: '', email: '' },
  autoSave: {
    enabled: true,
    debounceMs: 2000,
    onAutoSave: async (data) => await saveToServer(data)
  },
  crossFieldRules: [
    createCrossFieldRules.fieldMatch('password', 'confirmPassword')
  ],
  onValidationComplete: (fieldName, isValid, errors) => {
    console.log(`Field ${fieldName} validation:`, { isValid, errors });
  },
  onFormStateChange: (isDirty, isValid) => {
    console.log('Form state changed:', { isDirty, isValid });
  }
});

// Connect with superforms
formIntegration.connectSuperForm(superform);

// Update field with integrated validation
await formIntegration.updateField('email', 'user@example.com');

// Handle field blur
await formIntegration.onFieldBlur('email');

// Validate entire form
const validationState = await formIntegration.validateForm();
```

## Usage in SmartForm Component

The enhanced systems integrate seamlessly with the existing SmartForm component:

```svelte
<script lang="ts">
  import { createEnhancedFormIntegration } from '$lib/validation/enhanced-form-integration';
  import SmartForm from '$lib/components/forms/SmartForm.svelte';
  
  const formIntegration = createEnhancedFormIntegration({
    schema: categorySchema,
    initialData: form.data,
    autoSave: {
      enabled: true,
      debounceMs: 2000,
      onAutoSave: async (data) => {
        await fetch('/api/categories/autosave', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    },
    validateOnChange: true,
    validateOnBlur: true
  });
  
  // Connect with superforms
  formIntegration.connectSuperForm(superform);
</script>

<SmartForm
  {form}
  {schema}
  action="?/categoryUpsert"
  entityName="Category"
  config={{
    title: "Category Management",
    layout: "two-column",
    fieldOverrides: {
      description: { type: 'textarea' }
    }
  }}
  onSuccess={(data) => {
    formIntegration.markAsSaved();
    goto('/categories');
  }}
/>

<!-- Display enhanced state information -->
{#if formIntegration.formState.hasUnsavedChanges}
  <div class="alert alert-warning">
    You have unsaved changes
  </div>
{/if}

{#if formIntegration.formState.isAutoSaving}
  <div class="alert alert-info">
    Auto-saving...
  </div>
{/if}
```

## Key Features

### Auto-save with Debouncing
- Automatically saves form data after user stops typing
- Configurable debounce delay
- Excludes specified fields from auto-save
- Provides visual feedback during save operations

### Real-time Validation
- Validates fields as user types (with debouncing)
- Caches validation results for performance
- Supports async validation (e.g., server-side checks)
- Cross-field validation for dependent fields

### Dirty State Tracking
- Tracks which fields have been modified
- Provides form-level dirty state
- Warns users about unsaved changes
- Integrates with browser navigation warnings

### Advanced Validation Features
- Field-level validation with immediate feedback
- Cross-field validation (e.g., password confirmation)
- Conditional validation based on other field values
- Async validation with caching
- Custom validation rules
- Internationalization support

### Performance Optimizations
- Debounced validation to reduce API calls
- Validation result caching
- Efficient dirty state tracking
- Minimal re-renders with Svelte 5 runes

## Configuration Options

### Auto-save Configuration
```typescript
interface AutoSaveConfig {
  enabled: boolean;
  debounceMs: number; // Default: 2000ms
  onAutoSave?: (data: unknown) => Promise<void>;
  excludeFields?: string[]; // Fields to exclude from auto-save
}
```

### Validation Configuration
```typescript
interface ValidationConfig {
  validateOnChange?: boolean; // Default: true
  validateOnBlur?: boolean; // Default: true
  debounceValidationMs?: number; // Default: 300ms
  enableRealTimeValidation?: boolean; // Default: true
  validationCaching?: boolean; // Default: true
  validationCacheTtlMs?: number; // Default: 5 minutes
}
```

### Cross-field Validation Rules
```typescript
// Built-in cross-field rules
const rules = [
  createCrossFieldRules.fieldMatch('password', 'confirmPassword'),
  createCrossFieldRules.fieldGreaterThan('endDate', 'startDate'),
  createCrossFieldRules.conditionalRequired('phone', 'contactMethod', 'phone')
];
```

### Custom Async Validation
```typescript
const asyncRules = {
  username: {
    name: 'username_unique',
    validator: async (value, fieldName, formData) => {
      const response = await fetch(`/api/check-username/${value}`);
      const { exists } = await response.json();
      return {
        isValid: !exists,
        errors: exists ? ['Username already taken'] : [],
        fieldName,
        timestamp: new Date()
      };
    },
    debounceMs: 500,
    cacheKey: (value) => `username_${value}`,
    cacheTtlMs: 60000 // 1 minute
  }
};
```

## Integration with Existing Components

The enhanced form systems are designed to work seamlessly with existing form components:

- **SmartForm.svelte** - Main form component with enhanced state integration
- **SmartField.svelte** - Individual field component with real-time validation
- **Field Components** - All existing field components (SmartInput, SmartSelect, etc.)

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors** - Field-level and form-level validation errors
- **Network Errors** - Graceful handling of auto-save and async validation failures
- **Recovery Mechanisms** - Automatic retry for failed operations
- **User Feedback** - Clear error messages and loading states

## Performance Considerations

- **Debouncing** - Prevents excessive validation calls
- **Caching** - Reduces redundant validation operations
- **Lazy Loading** - Validation rules loaded on demand
- **Memory Management** - Proper cleanup of timeouts and subscriptions

## Browser Compatibility

- **Modern Browsers** - Full support for all features
- **Svelte 5 Runes** - Requires Svelte 5+ for reactive state management
- **TypeScript** - Full TypeScript support with comprehensive type definitions