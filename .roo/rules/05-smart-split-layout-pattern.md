# RooCode: Smart Split Layout Pattern

## 1. Overview

The **Smart Split Layout Pattern** provides a responsive side-by-side layout for managing entities with related data. This pattern transforms the traditional vertical stacking of forms and related tables into an efficient split-screen interface with tabbed organization for multiple related tables.

The pattern consists of:
1. **Split Layout Container**: Responsive left-right panel layout
2. **Main Entity Form**: Left panel for primary entity CRUD operations
3. **Tabbed Related Tables**: Right panel with organized tabs for related data
4. **Responsive Design**: Graceful degradation to vertical stack on mobile
5. **Configuration System**: Declarative setup for layout and tab behavior

---

## 2. Architecture Components

### Core Files Structure
```
src/routes/(app)/your-route/edit/[[id]]/
├── +page.server.ts              # Server logic (unchanged from Smart CRUD)
├── +page.svelte                 # Updated to use SmartSplitLayout
├── entity.payload.ts            # Main entity payload (unchanged)
├── related-entity.payload.ts    # Related entity payloads (unchanged)
└── related-configs.ts           # Enhanced with tab configurations

src/lib/components/forms/
├── SmartSplitLayout.svelte      # Main split layout container
├── SmartRelatedTabs.svelte      # Tab container for related tables
├── SmartTabPanel.svelte         # Individual tab panel wrapper
├── SmartForm.svelte             # Optimized for split context
└── SmartRelatedTable.svelte     # Optimized for tab context

src/lib/types/
└── split-layout-config.types.ts # Type definitions

src/lib/utils/
└── split-layout-config.builder.ts # Configuration builders
```

### Supporting Infrastructure
- **Type System**: Comprehensive TypeScript interfaces for configuration
- **Builder Pattern**: Declarative configuration builders
- **Responsive System**: CSS container queries and breakpoint management
- **Tab Management**: State management and navigation
- **Integration Layer**: Seamless integration with existing Smart CRUD pattern

---

## 3. Implementation Steps

### Step 1: Create Type Definitions

Define comprehensive interfaces for split layout configuration:

```typescript
// src/lib/types/split-layout-config.types.ts
export interface SplitLayoutConfig {
  leftPanel: PanelConfig;
  rightPanel: PanelConfig;
  responsive: ResponsiveConfig;
  gap: string;
  className?: string;
}

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
```

### Step 2: Create Configuration Builders

Implement declarative builders for easy configuration:

```typescript
// src/lib/utils/split-layout-config.builder.ts
export function createSplitLayoutConfig(): SplitLayoutConfigBuilder {
  return {
    leftPanel(config: Partial<PanelConfig>) { /* ... */ },
    rightPanel(config: Partial<PanelConfig>) { /* ... */ },
    responsive(config: Partial<ResponsiveConfig>) { /* ... */ },
    build(): SplitLayoutConfig { /* ... */ }
  };
}

export function createTabConfig(
  id: string,
  label: string,
  component: any,
  props: any,
  options?: TabOptions
): TabConfig { /* ... */ }
```

### Step 3: Implement Core Components

Create the main layout and tab components:

```svelte
<!-- src/lib/components/forms/SmartSplitLayout.svelte -->
<script lang="ts">
  import type { SmartSplitLayoutProps } from '$lib/types/split-layout-config.types';
  
  interface Props extends SmartSplitLayoutProps {
    leftPanel: any; // Svelte snippet
    rightPanel: any; // Svelte snippet
  }
  
  let { config = {}, leftPanel, rightPanel }: Props = $props();
</script>

<div class="smart-split-layout flex flex-col lg:flex-row h-full w-full">
  <div class="smart-split-layout__left">
    {@render leftPanel()}
  </div>
  <div class="smart-split-layout__right">
    {@render rightPanel()}
  </div>
</div>
```

### Step 4: Enhance Related Table Configuration

Extend existing related table config with tab metadata:

```typescript
// Enhanced related-configs.ts
export const attributeSetAttributesConfig = createRelatedTableConfig()
  .title('Attributes in Set')
  .tab({
    tabId: 'attributes',
    tabLabel: 'Attributes',
    tabIcon: 'ph:list',
    tabOrder: 1,
    tabBadgeKey: 'count'
  })
  .column(columnTypes.lookup('attribute_id', 'Attribute', 'attributes'))
  // ... other columns
  .build();

export const splitLayoutConfig = createSplitLayoutConfig()
  .leftPanel({ title: 'Entity Details', width: '45%' })
  .rightPanel({ title: 'Related Data', width: '55%' })
  .responsive({ breakpoint: '768px', stackOrder: 'form-first' })
  .build();
```

### Step 5: Update Route Implementation

Transform existing route to use split layout:

```svelte
<!-- Updated +page.svelte -->
<script lang="ts">
  import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
  import SmartForm from '$lib/components/forms/SmartForm.svelte';
  import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
  
  let { data } = $props();
  const tabConfigs = createTabConfigs(data);
</script>

<SmartSplitLayout config={splitLayoutConfig}>
  {#snippet leftPanel()}
    <SmartForm
      entityName="Your Entity"
      form={data.form}
      schema={yourEntitySchema}
      config={formConfig}
      action="?/upsert"
      deleteAction="?/delete"
    />
  {/snippet}

  {#snippet rightPanel()}
    {#if data.entity?.id}
      <SmartRelatedTabs {tabConfigs} defaultTab="firstTab" />
    {:else}
      <div class="empty-state">
        Save the entity to manage related data
      </div>
    {/if}
  {/snippet}
</SmartSplitLayout>
```

---

## 4. Complete Example

To clarify the pattern, here is a complete, real-world example for an "Attribute Set" entity that has a related table of "Attributes".

### `src/routes/(app)/catalog/product-attributes/attribute-sets/edit/[[id]]/related-configs.ts`

This file defines the configuration for the related table, the split layout, and a helper function to generate the tab configurations.

```typescript
import { mAttributesetAttributeInsertSchema } from '@tihomir971/assist-shared';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
import type { SuperValidated } from 'sveltekit-superforms';
import type { Component } from 'svelte';

// Form config for the related attribute records
const formConfig = createFormConfig()
	.title('Attribute Set Attribute')
	.fieldTyped('attribute_id', { label: 'Attribute', type: 'select', span: 12 })
	.fieldTyped('sequence', { label: 'Sequence', type: 'number', span: 6 })
	.fieldTyped('is_required', { label: 'Required', type: 'boolean', span: 3 })
	.fieldTyped('is_active', { label: 'Active', type: 'boolean', span: 3 })
	.build();

// Configuration for the related attributes table
export const attributeSetAttributesConfig = createRelatedTableConfig()
	.title('Attributes in Set')
	.tab({
		tabId: 'attributes',
		tabLabel: 'Attributes',
		tabIcon: 'ph:list'
	})
	.column(columnTypes.lookup('attribute_id', 'Attribute', 'attributes'))
	.column(columnTypes.number('sequence', 'Sequence'))
	.formSchema(mAttributesetAttributeInsertSchema)
	.formConfig(formConfig)
	.actions('?/attributeUpsert', '?/attributeUpsert', '?/attributeDelete')
	.parentIdField('attributeset_id')
	.build();

// Configuration for the split layout itself
export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '45%' })
	.rightPanel({ width: '55%' })
	.build();

// Helper function to dynamically create tab configurations
export function createTabConfigs(data: {
	attributeSetAttributes: Record<string, unknown>[];
	formAttributeSetAttributes: SuperValidated<Record<string, unknown>>;
	entity?: { id: number };
	attributes: Array<{ value: number; label: string }>;
}) {
	return [
		createTabConfig(
			'attributes',
			'Attributes',
			SmartRelatedTable as Component,
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
	];
}
```

### `src/routes/(app)/catalog/product-attributes/attribute-sets/edit/[[id]]/+page.svelte`

This Svelte page consumes the configurations and renders the layout.

```svelte
<script lang="ts">
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { splitLayoutConfig, createTabConfigs } from './related-configs';
	import { mAttributesetInsertSchema } from '@tihomir971/assist-shared';

	let { data } = $props();

	// Main form configuration
	const formConfig = createFormConfig()
		.title('Attribute Set')
		.fieldTyped('name', { label: 'Name', span: 6 })
		.fieldTyped('code', { label: 'Code', span: 6 })
		.fieldTyped('description', { label: 'Description', type: 'textarea', span: 12 })
		.fieldTyped('is_active', { label: 'Active', type: 'boolean', span: 12 })
		.build();

	// Create reactive tab configurations that update when data changes
	const tabConfigs = $derived(createTabConfigs(data));
</script>

<div class="container mx-auto h-full py-6">
	<SmartSplitLayout {config}={splitLayoutConfig}>
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
				<SmartRelatedTabs {tabs}={tabConfigs} defaultTab="attributes" />
			{:else}
				<div class="empty-state">
					Save the entity to manage related data.
				</div>
			{/if}
		{/snippet}
	</SmartSplitLayout>
</div>
```

---

## 5. Configuration Options

### Split Layout Configuration

```typescript
const splitLayoutConfig = createSplitLayoutConfig()
  .leftPanel({
    title: 'Main Form',           // Optional panel title
    width: '45%',                 // Panel width (desktop)
    minWidth: '400px',            // Minimum width constraint
    maxWidth: '600px',            // Maximum width constraint
    scrollable: true,             // Enable scrolling
    className: 'custom-class'     // Additional CSS classes
  })
  .rightPanel({
    title: 'Related Data',
    width: '55%',
    minWidth: '500px',
    scrollable: true
  })
  .responsive({
    breakpoint: '768px',          // Mobile breakpoint
    stackOrder: 'form-first',     // Stack order on mobile
    mobileGap: '1rem'            // Gap between panels on mobile
  })
  .gap('1.5rem')                 // Gap between panels
  .className('custom-layout')    // Layout container classes
  .build();
```

### Tab Configuration

```typescript
const tabConfigs = [
  createTabConfig(
    'attributes',                 // Unique tab ID
    'Attributes',                 // Display label
    SmartRelatedTable,           // Component to render
    {                            // Component props
      config: attributesConfig,
      items: data.attributes,
      validatedForm: data.formAttributes,
      parentId: data.entity?.id,
      lookupData: { /* ... */ }
    },
    {                            // Tab options
      icon: 'ph:list',           // Icon class
      badge: data.attributes?.length, // Badge content
      order: 1,                  // Display order
      description: 'Manage attributes', // Tooltip/description
      disabled: false            // Disable tab
    }
  )
];
```

### Enhanced Related Table Config

```typescript
export const relatedTableConfig = createRelatedTableConfig()
  .title('Related Items')
  .tab({
    tabId: 'items',
    tabLabel: 'Items',
    tabIcon: 'ph:squares-four',
    tabOrder: 1,
    tabBadgeKey: 'count',        // Show count as badge
    tabDescription: 'Manage related items'
  })
  .column(columnTypes.text('name', 'Name'))
  .column(columnTypes.boolean('is_active', 'Active'))
  .formSchema(relatedItemSchema)
  .formConfig(relatedFormConfig)
  .actions('?/itemUpsert', '?/itemUpsert', '?/itemDelete')
  .parentIdField('parent_id')
  .build();
```

---

## 5. Component Specifications

### SmartSplitLayout Component

**Props:**
- `config`: Split layout configuration object
- `leftPanel`: Svelte snippet for left panel content
- `rightPanel`: Svelte snippet for right panel content

**Features:**
- Responsive design with configurable breakpoints
- Flexible panel sizing with min/max constraints
- CSS container queries for optimal responsive behavior
- Customizable gap and styling
- Accessibility support with proper ARIA labels

### SmartRelatedTabs Component

**Props:**
- `tabs`: Array of tab configurations
- `defaultTab`: Initial active tab ID
- `orientation`: Tab orientation ('horizontal' | 'vertical')
- `variant`: Tab styling variant ('default' | 'pills' | 'underline')
- `onTabChange`: Callback for tab changes

**Features:**
- Dynamic tab rendering from configuration
- Badge support for showing counts
- Icon support for visual identification
- Disabled state handling
- Keyboard navigation support
- Tab ordering and sorting

### SmartTabPanel Component

**Props:**
- `tabId`: Unique identifier for the tab
- `isActive`: Whether the tab is currently active
- `className`: Additional CSS classes
- `children`: Tab content (Svelte snippet)

**Features:**
- Lazy rendering optimization
- Proper ARIA attributes for accessibility
- Smooth transitions between tabs
- Content preservation during tab switches

---

## 6. Responsive Design

### Breakpoint Behavior

The split layout automatically adapts to different screen sizes:

**Desktop (> 768px):**
- Side-by-side layout with configured widths
- Panels maintain minimum width constraints
- Horizontal scrolling if content exceeds panel width

**Tablet (768px - 1024px):**
- Reduced panel widths with flexible sizing
- Maintained side-by-side layout
- Optimized spacing and typography

**Mobile (< 768px):**
- Vertical stacking of panels
- Full-width panels for optimal mobile experience
- Configurable stacking order (form-first or tabs-first)
- Touch-optimized tab navigation

### CSS Container Queries

The pattern uses modern CSS container queries for optimal responsive behavior:

```css
.smart-split-layout {
  container-type: inline-size;
}

@container (max-width: 768px) {
  .smart-split-layout {
    flex-direction: column;
  }
}
```

---

## 7. Integration with Existing Patterns

### Smart CRUD Integration

The split layout pattern seamlessly integrates with existing Smart CRUD patterns:

- **Server Logic**: No changes required to `+page.server.ts`
- **Payload Builders**: Existing payload builders work unchanged
- **Form Configuration**: Existing form configs are compatible
- **Actions**: All CRUD actions continue to work as before

### Smart Related Tables Integration

Enhanced integration with Smart Related Tables:

- **Table Configurations**: Extended with tab metadata
- **Drawer Functionality**: Preserved within tab context
- **Bulk Operations**: Maintained across tab switches
- **Search and Filtering**: Scoped to individual tabs

### Smart List Page Integration

Can be combined with Smart List Page pattern for complex workflows:

- **List to Edit Flow**: Seamless navigation from list to split edit
- **Breadcrumb Integration**: Proper navigation context
- **State Preservation**: Maintain list filters when returning

---

## 8. Best Practices

### Layout Design
- **Use appropriate panel ratios**: 40/60 or 45/55 for optimal balance
- **Set minimum widths**: Prevent panels from becoming too narrow
- **Consider content density**: Adjust panel sizes based on form complexity
- **Test responsive behavior**: Verify layout works across all screen sizes

### Tab Organization
- **Logical grouping**: Group related functionality in tabs
- **Clear labeling**: Use descriptive tab labels with icons
- **Badge usage**: Show counts or status indicators appropriately
- **Tab ordering**: Arrange tabs by frequency of use or logical flow

### Performance Considerations
- **Lazy loading**: Load tab content only when needed
- **Data fetching**: Optimize server-side data loading
- **Component reuse**: Leverage existing Smart components
- **Memory management**: Properly clean up tab state

### Accessibility
- **Keyboard navigation**: Ensure full keyboard accessibility
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus management**: Maintain focus context during tab switches
- **Color contrast**: Ensure sufficient contrast for all elements

---

## 9. Migration Guide

### From Smart Linked Tables Pattern

**Step 1: Update Imports**
```typescript
// Add new imports
import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
```

**Step 2: Create Split Layout Configuration**
```typescript
// In related-configs.ts
export const splitLayoutConfig = createSplitLayoutConfig()
  .leftPanel({ title: 'Entity Details', width: '45%' })
  .rightPanel({ title: 'Related Data', width: '55%' })
  .build();
```

**Step 3: Add Tab Metadata to Related Configs**
```typescript
// Enhance existing related table configs
export const relatedConfig = createRelatedTableConfig()
  .title('Related Items')
  .tab({
    tabId: 'items',
    tabLabel: 'Items',
    tabIcon: 'ph:list',
    tabOrder: 1
  })
  // ... existing configuration
  .build();
```

**Step 4: Update Page Component**
```svelte
<!-- Replace existing layout with SmartSplitLayout -->
<SmartSplitLayout config={splitLayoutConfig}>
  {#snippet leftPanel()}
    <!-- Move existing SmartForm here -->
  {/snippet}
  
  {#snippet rightPanel()}
    <!-- Replace SmartRelatedTable with SmartRelatedTabs -->
    <SmartRelatedTabs {tabConfigs} />
  {/snippet}
</SmartSplitLayout>
```

**Step 5: Test and Refine**
- Test responsive behavior across devices
- Verify all CRUD operations work correctly
- Check accessibility with screen readers
- Optimize performance if needed

---

## 10. Advanced Features

### Custom Tab Templates

Create specialized tab layouts for different content types:

```typescript
// Custom tab component for charts/analytics
const analyticsTabConfig = createTabConfig(
  'analytics',
  'Analytics',
  CustomAnalyticsComponent,
  { data: analyticsData },
  { icon: 'ph:chart-bar', order: 99 }
);
```

### Dynamic Tab Loading

Implement lazy loading for performance optimization:

```typescript
const lazyTabConfig = createTabConfig(
  'heavy-data',
  'Heavy Data',
  LazyLoadedComponent,
  { loadData: () => import('./heavy-data-loader') },
  { badge: 'Loading...', disabled: true }
);
```

### Tab State Persistence

Preserve active tab in URL or localStorage:

```typescript
// URL-based tab persistence
const tabConfigs = createTabConfigs(data);
const activeTab = $page.url.searchParams.get('tab') || 'default';

// Update URL when tab changes
function handleTabChange(tabId: string) {
  const url = new URL($page.url);
  url.searchParams.set('tab', tabId);
  goto(url.toString(), { replaceState: true });
}
```

---

## 11. Troubleshooting

### Common Issues

**Layout not responsive:**
- Check CSS container query support
- Verify breakpoint configuration
- Test with browser dev tools

**Tabs not switching:**
- Verify tab IDs are unique
- Check component props binding
- Ensure proper event handling

**Performance issues:**
- Implement lazy loading for heavy tabs
- Optimize data fetching strategies
- Use proper component keys for lists

**Accessibility problems:**
- Add proper ARIA labels
- Test with keyboard navigation
- Verify screen reader compatibility

### Debug Mode

Enable debug mode for development:

```svelte
<SmartSplitLayout config={splitLayoutConfig} debug={true}>
  <!-- Layout content -->
</SmartSplitLayout>
```

---

## 12. Future Enhancements

### Planned Features
1. **Drag & Drop Tab Reordering**: Allow users to customize tab order
2. **Split Pane Resizing**: Interactive panel size adjustment
3. **Tab Persistence**: Remember tab state across sessions
4. **Custom Tab Animations**: Smooth transitions and effects
5. **Nested Tab Support**: Tabs within tabs for complex hierarchies

### Experimental Features
1. **AI-Powered Tab Suggestions**: Intelligent tab organization
2. **Collaborative Editing**: Multi-user tab synchronization
3. **Voice Navigation**: Voice commands for tab switching
4. **Gesture Support**: Touch gestures for mobile navigation

---

## 13. Examples and Use Cases

### Product Management
- **Left Panel**: Product details form
- **Right Tabs**: Variants, Pricing, Images, Reviews, Analytics

### Customer Management
- **Left Panel**: Customer information form
- **Right Tabs**: Orders, Addresses, Payment Methods, Support Tickets

### Project Management
- **Left Panel**: Project details form
- **Right Tabs**: Tasks, Team Members, Files, Timeline, Budget

### Content Management
- **Left Panel**: Article editor form
- **Right Tabs**: Media, SEO, Comments, Versions, Analytics

This pattern provides a powerful and flexible foundation for building complex entity management interfaces while maintaining excellent user experience and code maintainability.