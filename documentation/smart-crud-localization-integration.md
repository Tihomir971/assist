# Smart CRUD Localization Integration Plan

## Overview

This document outlines the comprehensive integration strategy for connecting the LocaleManager with existing Smart CRUD patterns to enable automatic localization of data display based on user preferences.

## Current State Analysis

### Key Integration Points Identified

1. **MultilingualInput Component** - Currently hardcodes `en-US` as default locale
2. **Service Layer** - `CategoryService.getLookup()` hardcodes `"en-US"` in SQL queries
3. **SmartForm/SmartField** - No direct locale integration
4. **Layout Server** - Already loads user preferences but doesn't pass to services

### Critical Code Locations

- `src/lib/components/forms/fields/multilingual/MultilingualInput.svelte:68` - Hardcoded default locale
- `src/lib/services/supabase/category.service.ts:102` - Hardcoded locale in SQL: `label:names->>"en-US"`
- `src/lib/services/supabase/category.service.ts:112` - Hardcoded locale in tree query

## Integration Strategy

### Phase 1: Enhanced Service Layer

#### 1.1 Create Localized Service Interface

**File:** `src/lib/services/base/localized.service.ts`

```typescript
import type { LocaleLookup } from '$lib/types/multilingual.types';

/**
 * Interface for services that support localized data retrieval
 */
export interface LocalizedService {
  /**
   * Get lookup data localized to user's preferred locale
   * @param preferredLocale - User's preferred data locale
   * @param fallbackLocale - Fallback locale if preferred not available
   */
  getLocalizedLookup(
    preferredLocale: string, 
    fallbackLocale?: string
  ): Promise<Array<{ value: number; label: string }>>;
}

/**
 * Interface for services that support localized tree structures
 */
export interface LocalizedTreeService extends LocalizedService {
  /**
   * Get tree structure localized to user's preferred locale
   */
  getLocalizedTree(
    preferredLocale: string, 
    fallbackLocale?: string
  ): Promise<Array<{ value: number; label: string; parent_id?: number }>>;
}

/**
 * Utility function to build localized SQL selector
 * @param fieldName - The JSONB field name (e.g., 'names')
 * @param preferredLocale - User's preferred locale
 * @param fallbackLocale - Fallback locale
 * @returns SQL selector string with fallback logic
 */
export function buildLocalizedSelector(
  fieldName: string,
  preferredLocale: string,
  fallbackLocale: string = 'sr-Latn-RS'
): string {
  return `COALESCE(${fieldName}->>'${preferredLocale}', ${fieldName}->>'${fallbackLocale}', ${fieldName}->>'en-US')`;
}
```

#### 1.2 Enhanced CategoryService - Automatic Locale Detection

**File:** `src/lib/services/supabase/category.service.ts` (modifications)

```typescript
import { LocalizedService, LocalizedTreeService, buildLocalizedSelector } from '../base/localized.service';
import { getCurrentUserLocale } from '$lib/utils/locale.utils';

export class CategoryService implements
  CRUDService<Category, CategoryCreate, CategoryUpdate>,
  LocalizedTreeService {
  
  // ... existing methods ...

  /**
   * Enhanced getLookup() method with automatic locale detection
   * Automatically reads user's preferred locale from context/session
   */
  async getLookup(): Promise<CategoryLookup[]> {
    // Automatically detect user's preferred locale
    const preferredLocale = await getCurrentUserLocale(this.supabase);
    const fallbackLocale = 'sr-Latn-RS';

    const labelSelector = buildLocalizedSelector('names', preferredLocale, fallbackLocale);
    
    const { data, error } = await this.supabase
      .from('m_product_category')
      .select(`value:id, label:(${labelSelector})`)
      .order('names');

    if (error) throw new Error(`Failed to load category lookup: ${error.message}`);
    return data || [];
  }

  /**
   * Enhanced getCategoryTree() method with automatic locale detection
   * Automatically reads user's preferred locale from context/session
   */
  async getCategoryTree(): Promise<Output[]> {
    // Automatically detect user's preferred locale
    const preferredLocale = await getCurrentUserLocale(this.supabase);
    const fallbackLocale = 'sr-Latn-RS';

    const labelSelector = buildLocalizedSelector('names', preferredLocale, fallbackLocale);
    
    const { data, error } = await this.supabase
      .from('m_product_category')
      .select(`value:id, label:(${labelSelector}), parent_id`)
      .order('names');

    if (error) throw new Error(`Failed to load category tree: ${error.message}`);
    
    // ... existing tree building logic remains the same ...
  }
}
```

### Phase 2: Enhanced Layout Server Integration

#### 2.1 Pass User Locale to Services

**File:** `src/routes/(app)/+layout.server.ts` (modifications)

```typescript
export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, depends }) => {
  depends('catalog:categories');
  depends('user:preferences');

  const { session } = await safeGetSession();
  if (!session) redirect(303, '/');

  const categoryService = new CategoryService(supabase);
  const localeService = new LocaleService(supabase);
  const preferencesService = new UserPreferencesService(supabase);

  const [profile, availableLocales, userPreferences] = await Promise.all([
    supabase
      .from('ad_user')
      .select('first_name, last_name, avatar_url')
      .eq('auth_user_id', session.user.id)
      .single()
      .then(({ data }) => data),
    localeService.getLocales(),
    preferencesService.getUserPreferences(session.user.id)
  ]);

  // Determine effective data locale
  const defaultLocale = availableLocales.find((l) => l.isDefault)?.value || 'sr-Latn-RS';
  const effectiveDataLocale = userPreferences?.preferred_data_locale || defaultLocale;

  // Load localized category tree using user's preferred locale
  const categoryTree = await categoryService.getLocalizedTree(effectiveDataLocale, defaultLocale);

  return {
    session,
    profile,
    categoryTree,
    localePreferences: {
      preferredDataLocale: effectiveDataLocale,
      availableLocales
    }
  };
};
```

### Phase 3: Enhanced Multilingual Components

#### 3.1 LocaleManager Integration in MultilingualInput

**File:** `src/lib/components/forms/fields/multilingual/MultilingualInput.svelte` (modifications)

```typescript
import { getLocaleManagerContextSafe } from '$lib/stores/locale-manager.svelte';

// Replace hardcoded locale logic with LocaleManager integration
let activeLocale = $state('');
let availableLocales = $state<LocaleLookup[]>([]);

// Get LocaleManager from context
const localeManager = getLocaleManagerContextSafe();

// Initialize with user's preferred locale
$effect(() => {
  if (localeManager) {
    availableLocales = localeManager.availableLocales;
    // Set active locale to user's preferred locale instead of hardcoded default
    activeLocale = localeManager.currentDataLocale;
  } else {
    // Fallback to service call if LocaleManager not available
    (async () => {
      try {
        availableLocales = await localeService.getLocales();
        const defaultLocale = availableLocales.find((l) => l.isDefault)?.value || 'sr-Latn-RS';
        activeLocale = defaultLocale;
      } catch (e) {
        console.error('Failed to load locales:', e);
      }
    })();
  }
});
```

### Phase 4: Smart Form Integration

#### 4.1 Locale-Aware Form Configuration

**File:** `src/lib/utils/form-config.builder.ts` (enhancements)

```typescript
import { getLocaleManagerContextSafe } from '$lib/stores/locale-manager.svelte';

export class FormConfigBuilder<T extends Record<string, unknown>> {
  // ... existing methods ...

  /**
   * Configure multilingual input with automatic locale detection
   */
  multilingualInput<K extends keyof T>(
    fieldName: K,
    options: Omit<FieldOverride, 'type' | 'multilingualConfig'> & {
      requiredLocales?: string[];
      defaultLocale?: string; // Will be overridden by user preference
      showAddLocale?: boolean;
      copyBetweenLocales?: boolean;
    } = {}
  ) {
    // Get user's preferred locale from LocaleManager
    const localeManager = getLocaleManagerContextSafe();
    const userPreferredLocale = localeManager?.currentDataLocale;
    
    return this.field(fieldName, {
      ...options,
      type: 'multilingual_input',
      multilingualConfig: {
        required: options.requiredLocales,
        // Use user's preferred locale as default if available
        defaultLocale: userPreferredLocale || options.defaultLocale || 'sr-Latn-RS'
      }
    });
  }
}
```

### Phase 5: Server-Side Integration Patterns

#### 5.1 Enhanced Page Server Pattern

**Template for route `+page.server.ts` files:**

```typescript
import { getEffectiveLocale } from '$lib/utils/locale.utils';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();
  if (!session) redirect(303, '/auth');

  // Get user's effective locale
  const userPreferences = await new UserPreferencesService(supabase)
    .getUserPreferences(session.user.id);
  const effectiveLocale = getEffectiveLocale(userPreferences?.preferred_data_locale);

  // Use localized service methods
  const categoryService = new CategoryService(supabase);
  const [categories, entity] = await Promise.all([
    categoryService.getLocalizedLookup(effectiveLocale), // Instead of getLookup()
    // ... other data loading
  ]);

  return {
    categories,
    entity,
    // ... other data
  };
};
```

#### 5.2 Locale Utility Functions

**File:** `src/lib/utils/locale.utils.ts`

```typescript
import type { LocaleLookup } from '$lib/types/multilingual.types';

/**
 * Get effective locale with fallback logic
 */
export function getEffectiveLocale(
  preferredLocale?: string,
  availableLocales?: LocaleLookup[],
  fallback: string = 'sr-Latn-RS'
): string {
  if (!preferredLocale) return fallback;
  
  // Validate that preferred locale is available
  if (availableLocales) {
    const isAvailable = availableLocales.some(l => l.value === preferredLocale);
    if (!isAvailable) return fallback;
  }
  
  return preferredLocale;
}

/**
 * Build SQL selector for localized JSONB fields with fallback
 */
export function buildLocalizedSelector(
  fieldName: string,
  preferredLocale: string,
  fallbackLocale: string = 'sr-Latn-RS'
): string {
  return `COALESCE(${fieldName}->>'${preferredLocale}', ${fieldName}->>'${fallbackLocale}', ${fieldName}->>'en-US')`;
}
```

### Phase 6: Smart Table Integration

#### 6.1 Localized Column Display

**File:** `src/lib/utils/data-table-config.builder.ts` (enhancements)

```typescript
import { getLocaleManagerContextSafe } from '$lib/stores/locale-manager.svelte';
import { getLocalizedTranslation } from '$lib/utils/multilingual.utils';

export const columnTypes = {
  // ... existing column types ...

  /**
   * Localized text column that displays content in user's preferred locale
   */
  localizedText: (accessorKey: string, header: string) => ({
    accessorKey,
    header,
    cell: ({ getValue }) => {
      const localeManager = getLocaleManagerContextSafe();
      const preferredLocale = localeManager?.currentDataLocale || 'sr-Latn-RS';
      const multilingualData = getValue() as MultilingualData;
      
      return getLocalizedTranslation(multilingualData, preferredLocale);
    }
  }),

  /**
   * Lookup column that displays localized lookup data
   */
  localizedLookup: (accessorKey: string, header: string, lookupKey: string) => ({
    accessorKey,
    header,
    cell: ({ row, getValue }) => {
      const lookupData = row.original[lookupKey] as { names: MultilingualData };
      const localeManager = getLocaleManagerContextSafe();
      const preferredLocale = localeManager?.currentDataLocale || 'sr-Latn-RS';
      
      return getLocalizedTranslation(lookupData?.names, preferredLocale);
    }
  })
};
```

### Phase 7: Migration Strategy

#### 7.1 Backward Compatibility

All existing methods (`getLookup()`, `getCategoryTree()`, etc.) will be maintained for backward compatibility. They will internally call the new localized methods with default locale.

#### 7.2 Gradual Migration Plan

1. **Week 1**: Implement base localized service interfaces and utility functions
2. **Week 2**: Enhance CategoryService with localized methods
3. **Week 3**: Update MultilingualInput component to use LocaleManager
4. **Week 4**: Enhance layout server to pass user locale to services
5. **Week 5**: Update form builders and Smart components
6. **Week 6**: Migrate existing routes one by one to use localized methods

#### 7.3 Testing Strategy

1. **Unit Tests**: Test localized service methods with different locale combinations
2. **Integration Tests**: Test complete form workflows with different user locales
3. **E2E Tests**: Test user locale preference changes and immediate UI updates
4. **Performance Tests**: Ensure localized queries don't impact performance

## Implementation Checklist

### Service Layer
- [x] Create `LocalizedService` interface
- [x] Create `buildLocalizedSelector` utility
- [x] Enhance `CategoryService` with localized methods
- [ ] Enhance other services (Partner, Attribute, etc.) with localized methods
- [x] Add backward compatibility methods

### Component Layer
- [ ] Update `MultilingualInput` to use LocaleManager
- [ ] Update `MultilingualTextarea` to use LocaleManager
- [ ] Enhance `FormConfigBuilder` with locale awareness
- [ ] Update `SmartTable` column types for localized display

### Server Layer
- [x] Update layout server to pass user locale to services
- [x] Create locale utility functions
- [ ] Update page servers to use localized service methods
- [x] Add locale validation and fallback logic

### Integration
- [ ] Test complete user workflow from preference change to data display
- [ ] Verify immediate UI updates without page refresh
- [ ] Test fallback behavior when preferred locale unavailable
- [ ] Performance testing with localized queries

## Expected Benefits

1. **Automatic Localization**: All lookup data automatically displays in user's preferred locale
2. **Consistent Experience**: Same locale preference applies across all forms and tables
3. **Fallback Support**: Graceful degradation when preferred locale data unavailable
4. **Performance**: Efficient SQL queries with COALESCE for fallback logic
5. **Maintainability**: Clean separation of concerns with service layer abstraction

## Risk Mitigation

1. **Database Performance**: Use proper indexes on JSONB fields for localized queries
2. **Data Consistency**: Ensure all multilingual fields have fallback values
3. **Backward Compatibility**: Maintain existing API surface for gradual migration
4. **Error Handling**: Robust fallback logic when locale data missing
5. **Testing Coverage**: Comprehensive test suite for all locale combinations

This integration plan provides a comprehensive roadmap for seamlessly connecting user locale preferences with the existing Smart CRUD patterns while maintaining backward compatibility and ensuring optimal performance.