# Smart Split Layout Pattern - Implementation Plan

## Overview

This document outlines the complete implementation plan for the Smart Split Layout Pattern, which transforms the current vertical layout of Smart Linked Tables into a responsive side-by-side layout with tabbed related tables.

## 1. Type Definitions

### File: `src/lib/types/split-layout-config.types.ts`

```typescript
import type { ComponentType } from 'svelte';
import type { RelatedTableConfig } from './related-table-config.types';
import type { SuperValidated } from 'sveltekit-superforms';
import type { AnyZodObject } from 'zod';

// Main split layout configuration
export interface SplitLayoutConfig {
  leftPanel: PanelConfig;
  rightPanel: PanelConfig;
  responsive: ResponsiveConfig;
  gap: string;
  className?: string;
}

// Panel configuration
export interface PanelConfig {
  title?: string;
  width: string;
  minWidth: string;
  maxWidth?: string;
  className?: string;
  scrollable?: boolean;
}

// Responsive behavior configuration
export interface ResponsiveConfig {
  breakpoint: string;
  stackOrder: 'form-first' | 'tabs-first';
  mobileGap?: string;
}

// Tab configuration for related tables
export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  badge?: number | string;
  disabled?: boolean;
  order?: number;
  description?: string;
  component: ComponentType;
  props: any;
}

// Enhanced related table config with tab metadata
export interface RelatedTableTabConfig {
  tabId: string;
  tabLabel: string;
  tabIcon?: string;
  tabOrder?: number;
  tabBadgeKey?: string;
  tabDescription?: string;
  tabDisabled?: boolean;
}

// Builder interface for split layout configuration
export interface SplitLayoutConfigBuilder {
  leftPanel(config: Partial<PanelConfig>): SplitLayoutConfigBuilder;
  rightPanel(config: Partial<PanelConfig>): SplitLayoutConfigBuilder;
  responsive(config: Partial<ResponsiveConfig>): SplitLayoutConfigBuilder;
  gap(gap: string): SplitLayoutConfigBuilder;
  className(className: string): SplitLayoutConfigBuilder;
  build(): SplitLayoutConfig;
}

// Props for SmartSplitLayout component
export interface SmartSplitLayoutProps {
  config?: Partial<SplitLayoutConfig>;
  children?: any;
  leftPanel?: any; // Svelte snippet
  rightPanel?: any; // Svelte snippet
}

// Props for SmartRelatedTabs component
export interface SmartRelatedTabsProps {
  tabs: TabConfig[];
  defaultTab?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  onTabChange?: (tabId: string) => void;
}

// Props for SmartTabPanel component
export interface SmartTabPanelProps {
  tabId: string;
  isActive: boolean;
  className?: string;
  children?: any;
}
```

## 2. Configuration Builder

### File: `src/lib/utils/split-layout-config.builder.ts`

```typescript
import type {
  SplitLayoutConfig,
  SplitLayoutConfigBuilder,
  PanelConfig,
  ResponsiveConfig
} from '$lib/types/split-layout-config.types';

export function createSplitLayoutConfig(): SplitLayoutConfigBuilder {
  const config: Partial<SplitLayoutConfig> = {
    leftPanel: {
      width: '45%',
      minWidth: '400px',
      scrollable: true
    },
    rightPanel: {
      width: '55%',
      minWidth: '500px',
      scrollable: true
    },
    responsive: {
      breakpoint: '768px',
      stackOrder: 'form-first'
    },
    gap: '1rem'
  };

  return {
    leftPanel(panelConfig: Partial<PanelConfig>) {
      config.leftPanel = { ...config.leftPanel!, ...panelConfig };
      return this;
    },

    rightPanel(panelConfig: Partial<PanelConfig>) {
      config.rightPanel = { ...config.rightPanel!, ...panelConfig };
      return this;
    },

    responsive(responsiveConfig: Partial<ResponsiveConfig>) {
      config.responsive = { ...config.responsive!, ...responsiveConfig };
      return this;
    },

    gap(gap: string) {
      config.gap = gap;
      return this;
    },

    className(className: string) {
      config.className = className;
      return this;
    },

    build(): SplitLayoutConfig {
      return config as SplitLayoutConfig;
    }
  };
}

// Helper function to create tab configurations
export function createTabConfig(
  id: string,
  label: string,
  component: any,
  props: any,
  options?: {
    icon?: string;
    badge?: number | string;
    disabled?: boolean;
    order?: number;
    description?: string;
  }
): TabConfig {
  return {
    id,
    label,
    component,
    props,
    ...options
  };
}
```

## 3. Core Components

### File: `src/lib/components/forms/SmartSplitLayout.svelte`

```svelte
<script lang="ts">
  import type { SmartSplitLayoutProps } from '$lib/types/split-layout-config.types';
  import { cn } from '$lib/utils';

  interface Props extends SmartSplitLayoutProps {
    leftPanel: any; // Svelte snippet
    rightPanel: any; // Svelte snippet
  }

  let { config = {}, leftPanel, rightPanel }: Props = $props();

  // Default configuration
  const defaultConfig = {
    leftPanel: {
      width: '45%',
      minWidth: '400px',
      scrollable: true
    },
    rightPanel: {
      width: '55%',
      minWidth: '500px',
      scrollable: true
    },
    responsive: {
      breakpoint: '768px',
      stackOrder: 'form-first' as const
    },
    gap: '1rem'
  };

  const finalConfig = { ...defaultConfig, ...config };
  const { leftPanel: leftConfig, rightPanel: rightConfig, responsive, gap } = finalConfig;

  // Generate CSS custom properties for responsive behavior
  const cssVars = {
    '--left-width': leftConfig.width,
    '--left-min-width': leftConfig.minWidth,
    '--right-width': rightConfig.width,
    '--right-min-width': rightConfig.minWidth,
    '--gap': gap,
    '--breakpoint': responsive.breakpoint
  };
</script>

<div 
  class={cn(
    "smart-split-layout",
    "flex flex-col lg:flex-row",
    "h-full w-full",
    responsive.stackOrder === 'tabs-first' && "flex-col-reverse lg:flex-row",
    config.className
  )}
  style={Object.entries(cssVars).map(([key, value]) => `${key}: ${value}`).join('; ')}
>
  <!-- Left Panel -->
  <div 
    class={cn(
      "smart-split-layout__left",
      "flex-shrink-0",
      "w-full lg:w-[var(--left-width)]",
      "min-w-[var(--left-min-width)]",
      leftConfig.scrollable && "overflow-auto",
      "mb-4 lg:mb-0 lg:mr-[var(--gap)]",
      leftConfig.className
    )}
  >
    {#if leftConfig.title}
      <div class="mb-4">
        <h2 class="text-lg font-semibold">{leftConfig.title}</h2>
      </div>
    {/if}
    {@render leftPanel()}
  </div>

  <!-- Right Panel -->
  <div 
    class={cn(
      "smart-split-layout__right",
      "flex-1",
      "w-full lg:w-[var(--right-width)]",
      "min-w-[var(--right-min-width)]",
      rightConfig.scrollable && "overflow-auto",
      rightConfig.className
    )}
  >
    {#if rightConfig.title}
      <div class="mb-4">
        <h2 class="text-lg font-semibold">{rightConfig.title}</h2>
      </div>
    {/if}
    {@render rightPanel()}
  </div>
</div>

<style>
  .smart-split-layout {
    container-type: inline-size;
  }

  @container (max-width: 768px) {
    .smart-split-layout {
      flex-direction: column;
    }
    
    .smart-split-layout__left,
    .smart-split-layout__right {
      width: 100% !important;
      min-width: unset !important;
    }
  }
</style>
```

### File: `src/lib/components/forms/SmartRelatedTabs.svelte`

```svelte
<script lang="ts">
  import type { SmartRelatedTabsProps, TabConfig } from '$lib/types/split-layout-config.types';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Badge } from '$lib/components/ui/badge';
  import { cn } from '$lib/utils';

  let { 
    tabs, 
    defaultTab, 
    orientation = 'horizontal',
    variant = 'default',
    className,
    onTabChange
  }: SmartRelatedTabsProps = $props();

  // Sort tabs by order if specified
  const sortedTabs = $derived(
    [...tabs].sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  // Get the active tab ID
  let activeTab = $state(defaultTab || sortedTabs[0]?.id);

  // Handle tab change
  function handleTabChange(tabId: string) {
    activeTab = tabId;
    onTabChange?.(tabId);
  }

  // Get active tab configuration
  const activeTabConfig = $derived(
    sortedTabs.find(tab => tab.id === activeTab)
  );
</script>

<div class={cn("smart-related-tabs", className)}>
  <Tabs.Root value={activeTab} onValueChange={handleTabChange} {orientation}>
    <Tabs.List class={cn(
      "grid w-full",
      orientation === 'horizontal' 
        ? `grid-cols-${sortedTabs.length}` 
        : "grid-cols-1",
      variant === 'pills' && "bg-muted p-1 rounded-lg",
      variant === 'underline' && "border-b"
    )}>
      {#each sortedTabs as tab (tab.id)}
        <Tabs.Trigger 
          value={tab.id} 
          disabled={tab.disabled}
          class={cn(
            "flex items-center gap-2",
            variant === 'pills' && "data-[state=active]:bg-background data-[state=active]:shadow-sm",
            variant === 'underline' && "border-b-2 border-transparent data-[state=active]:border-primary"
          )}
        >
          {#if tab.icon}
            <i class={tab.icon}></i>
          {/if}
          <span>{tab.label}</span>
          {#if tab.badge !== undefined}
            <Badge variant="secondary" class="ml-1 text-xs">
              {tab.badge}
            </Badge>
          {/if}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>

    {#each sortedTabs as tab (tab.id)}
      <Tabs.Content value={tab.id} class="mt-4">
        {#if tab.description}
          <div class="mb-4 text-sm text-muted-foreground">
            {tab.description}
          </div>
        {/if}
        <svelte:component this={tab.component} {...tab.props} />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
```

### File: `src/lib/components/forms/SmartTabPanel.svelte`

```svelte
<script lang="ts">
  import type { SmartTabPanelProps } from '$lib/types/split-layout-config.types';
  import { cn } from '$lib/utils';

  let { 
    tabId, 
    isActive, 
    className,
    children 
  }: SmartTabPanelProps = $props();
</script>

<div 
  class={cn(
    "smart-tab-panel",
    "w-full h-full",
    !isActive && "hidden",
    className
  )}
  role="tabpanel"
  aria-labelledby={`tab-${tabId}`}
  {tabId}
>
  {#if children}
    {@render children()}
  {/if}
</div>
```

## 4. Enhanced Related Table Config

### File: `src/lib/utils/related-table-config.builder.ts` (Enhancement)

Add the following methods to the existing `RelatedTableConfigBuilder`:

```typescript
// Add to existing RelatedTableConfigBuilder interface
export interface RelatedTableConfigBuilder<T, S> {
  // ... existing methods ...
  
  // New tab configuration method
  tab(config: RelatedTableTabConfig): RelatedTableConfigBuilder<T, S>;
}

// Add to the createRelatedTableConfig function
export function createRelatedTableConfig<T, S>() {
  // ... existing implementation ...
  
  return {
    // ... existing methods ...
    
    tab(tabConfig: RelatedTableTabConfig) {
      config.tabConfig = tabConfig;
      return this;
    },
    
    // ... rest of existing methods ...
  };
}
```

## 5. Updated Route Implementation

### File: `src/routes/(app)/catalog/product-attributes/attribute-sets/edit/[[id]]/related-configs.ts`

```typescript
import { mAttributesetAttributeInsertSchema } from '$lib/types/supabase.zod.schemas';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';

const formConfig = createFormConfig()
  .title('Attribute Set Attribute')
  .field('attribute_id', {
    label: 'Attribute',
    type: 'select',
    span: 12
  })
  .field('sequence', {
    label: 'Sequence',
    type: 'number',
    span: 6
  })
  .field('is_required', {
    label: 'Required',
    type: 'boolean',
    span: 3
  })
  .field('is_active', {
    label: 'Active',
    type: 'boolean',
    span: 3
  })
  .build();

export const attributeSetAttributesConfig = createRelatedTableConfig()
  .title('Attributes in Set')
  .tab({
    tabId: 'attributes',
    tabLabel: 'Attributes',
    tabIcon: 'ph:list',
    tabOrder: 1,
    tabBadgeKey: 'count',
    tabDescription: 'Manage attributes that belong to this attribute set'
  })
  .column(columnTypes.lookup('attribute_id', 'Attribute', 'attributes'))
  .column(columnTypes.number('sequence', 'Sequence'))
  .column(columnTypes.boolean('is_required', 'Required'))
  .column(columnTypes.boolean('is_active', 'Active'))
  .formSchema(mAttributesetAttributeInsertSchema)
  .formConfig(formConfig)
  .actions('?/attributeUpsert', '?/attributeUpsert', '?/attributeDelete')
  .parentIdField('attributeset_id')
  .build();

// Split layout configuration
export const splitLayoutConfig = createSplitLayoutConfig()
  .leftPanel({
    title: 'Attribute Set Details',
    width: '45%',
    minWidth: '400px'
  })
  .rightPanel({
    title: 'Related Data',
    width: '55%',
    minWidth: '500px'
  })
  .responsive({
    breakpoint: '768px',
    stackOrder: 'form-first'
  })
  .build();

// Tab configurations helper function
export function createTabConfigs(data: any) {
  return [
    createTabConfig(
      'attributes',
      'Attributes',
      SmartRelatedTable,
      {
        config: attributeSetAttributesConfig,
        items: data.attributeSetAttributes,
        validatedForm: data.formAttributeSetAttributes,
        parentId: data.entity?.id,
        lookupData: { attributes: data.attributes }
      },
      {
        badge: data.attributeSetAttributes?.length || 0,
        description: 'Manage attributes that belong to this attribute set'
      }
    )
    // Additional tabs can be added here for future related tables
  ];
}
```

### File: `src/routes/(app)/catalog/product-attributes/attribute-sets/edit/[[id]]/+page.svelte`

```svelte
<script lang="ts">
  import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
  import SmartForm from '$lib/components/forms/SmartForm.svelte';
  import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
  import { createFormConfig } from '$lib/utils/form-config.builder';
  import { splitLayoutConfig, createTabConfigs } from './related-configs';
  import { mAttributesetInsertSchema } from '$lib/types/supabase.zod.schemas';

  let { data } = $props();

  const formConfig = createFormConfig()
    .title('Attribute Set')
    .field('name', {
      label: 'Name',
      span: 6,
      placeholder: 'e.g., Electronics, Clothing'
    })
    .field('code', {
      label: 'Code',
      span: 6,
      placeholder: 'e.g., ELECTRONICS, CLOTHING'
    })
    .field('description', {
      label: 'Description',
      type: 'textarea',
      span: 12,
      placeholder: 'Enter a description for the attribute set'
    })
    .field('is_active', {
      label: 'Active',
      type: 'boolean',
      span: 12
    })
    .build();

  // Create tab configurations
  const tabConfigs = createTabConfigs(data);
</script>

<div class="container mx-auto h-full py-6">
  <SmartSplitLayout config={splitLayoutConfig}>
    {#snippet leftPanel()}
      <SmartForm
        entityName="Attribute Set"
        form={data.form}
        schema={mAttributesetInsertSchema}
        config={formConfig}
        action="?/upsert"
        deleteAction="?/delete"
      />
    {/snippet}

    {#snippet rightPanel()}
      {#if data.entity?.id}
        <SmartRelatedTabs 
          tabs={tabConfigs} 
          defaultTab="attributes"
          variant="default"
        />
      {:else}
        <div class="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
          <div class="text-center">
            <p class="text-lg font-medium">Save Attribute Set First</p>
            <p class="text-sm mt-1">Complete the form on the left to manage related data</p>
          </div>
        </div>
      {/if}
    {/snippet}
  </SmartSplitLayout>
</div>
```

## 6. CSS Enhancements

### File: `src/app.css` (Add these styles)

```css
/* Smart Split Layout Styles */
.smart-split-layout {
  --split-gap: 1rem;
  --split-left-width: 45%;
  --split-right-width: 55%;
  --split-left-min-width: 400px;
  --split-right-min-width: 500px;
  --split-breakpoint: 768px;
}

.smart-split-layout__left,
.smart-split-layout__right {
  transition: width 0.2s ease-in-out;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .smart-split-layout {
    flex-direction: column !important;
  }
  
  .smart-split-layout__left,
  .smart-split-layout__right {
    width: 100% !important;
    min-width: unset !important;
    margin: 0 !important;
  }
  
  .smart-split-layout__left {
    margin-bottom: var(--split-gap) !important;
  }
}

/* Tab enhancements */
.smart-related-tabs .tabs-list {
  background: hsl(var(--muted));
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.smart-related-tabs .tabs-trigger {
  transition: all 0.2s ease-in-out;
}

.smart-related-tabs .tabs-trigger[data-state="active"] {
  background: hsl(var(--background));
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}
```

## 7. Testing Strategy

1. **Component Testing**: Test each component in isolation
2. **Integration Testing**: Test the complete split layout with real data
3. **Responsive Testing**: Verify behavior across different screen sizes
4. **Accessibility Testing**: Ensure proper ARIA labels and keyboard navigation
5. **Performance Testing**: Check for any performance regressions

## 8. Migration Guide

For existing routes using Smart Linked Tables:

1. Import the new components
2. Wrap existing form in `SmartSplitLayout`
3. Move related tables to tab configurations
4. Update related configs with tab metadata
5. Test responsive behavior

## 9. Future Enhancements

1. **Drag & Drop Tab Reordering**: Allow users to reorder tabs
2. **Tab Persistence**: Remember active tab in URL or localStorage
3. **Lazy Loading**: Load tab content only when activated
4. **Custom Tab Templates**: Support for different tab layouts
5. **Split Pane Resizing**: Allow users to resize panels
6. **Keyboard Shortcuts**: Add keyboard navigation for tabs

## 10. Documentation Update

This pattern will be documented in `.roo/rules/05-smart-split-layout-pattern.md` with:

- Complete usage guide
- Configuration options
- Best practices
- Migration instructions
- Examples and use cases

## Implementation Priority

1. **Phase 1**: Core components and types ✅ (This plan)
2. **Phase 2**: Implement components in Code mode
3. **Phase 3**: Update attribute sets route
4. **Phase 4**: Test and refine
5. **Phase 5**: Create documentation
6. **Phase 6**: Apply to other routes as needed

This implementation plan provides a comprehensive foundation for the Smart Split Layout Pattern that will enhance the user experience and provide a reusable solution for managing entities with related data.