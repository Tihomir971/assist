# Combobox Component

A reusable, accessible combobox component built with Svelte 5 runes, Bits UI, and Tailwind CSS.

## Features

- 🎯 **Type-safe**: Full TypeScript support with proper type definitions
- 🔄 **Two-way binding**: Supports `bind:value` for reactive state management
- 🔍 **Search functionality**: Built-in search/filter capability
- ♿ **Accessible**: Follows ARIA combobox patterns
- 🎨 **Customizable**: Configurable placeholders, width, and styling
- 📱 **Responsive**: Works on all screen sizes
- ⚡ **Performant**: Uses Svelte 5 runes for optimal reactivity

## Installation

The component is already available in your project. Import it from the ui-custom package:

```typescript
import { Combobox } from '$lib/components/ui-custom';
import type { ComboboxItem } from '$lib/components/ui-custom';
```

## Basic Usage

```svelte
<script lang="ts">
  import { Combobox } from '$lib/components/ui-custom';
  
  const items: ComboboxItem[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];
  
  let selectedValue = $state('');
</script>

<Combobox 
  bind:value={selectedValue}
  {items}
  placeholder="Select an option..."
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The current selected value (supports two-way binding) |
| `items` | `ComboboxItem[]` | `[]` | Array of items to display in the dropdown |
| `placeholder` | `string` | `'Select an item...'` | Placeholder text when no item is selected |
| `searchPlaceholder` | `string` | `'Search items...'` | Placeholder text for the search input |
| `width` | `string` | `'200px'` | Width of the combobox |
| `emptyMessage` | `string` | `'No items found.'` | Message shown when no items match the search |
| `disabled` | `boolean` | `false` | Whether the combobox is disabled |
| `className` | `string` | `''` | Additional CSS classes for the trigger button |
| `onSelect` | `(value: string) => void` | `undefined` | Callback function called when an item is selected |
| `label` | `string` | `undefined` | Optional label text displayed above the combobox |
| `name` | `string` | `undefined` | Name attribute for the hidden input (required for form submission) |
| `id` | `string` | `undefined` | ID attribute for the combobox (auto-generated if not provided) |
| `required` | `boolean` | `false` | Whether the combobox is required (adds asterisk to label and sets aria-required) |

## Type Definitions

```typescript
export type ComboboxItem = {
  value: string;
  label: string;
};
```

## Advanced Examples

### With Custom Callback

```svelte
<script lang="ts">
  import { Combobox } from '$lib/components/ui-custom';
  
  const frameworks = [
    { value: 'sveltekit', label: 'SvelteKit' },
    { value: 'next', label: 'Next.js' },
    { value: 'nuxt', label: 'Nuxt.js' }
  ];
  
  let selectedFramework = $state('');
  
  function handleSelection(value: string) {
    console.log('Selected:', value);
    // Perform additional actions
  }
</script>

<Combobox 
  bind:value={selectedFramework}
  items={frameworks}
  placeholder="Choose a framework"
  onSelect={handleSelection}
/>
```

### With Label and Form Integration

```svelte
<script lang="ts">
  import { Combobox } from '$lib/components/ui-custom';
  
  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' }
  ];
  
  let selectedCategory = $state('');
  
  function handleSubmit() {
    // The value is automatically included in form submission
    // via the hidden input with name="category"
    console.log('Selected category:', selectedCategory);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <Combobox
    bind:value={selectedCategory}
    items={categories}
    label="Product Category"
    name="category"
    placeholder="Select a category"
    required={true}
  />
  <button type="submit">Submit</button>
</form>
```

### With Custom Styling

```svelte
<Combobox
  bind:value={selectedValue}
  {items}
  width="300px"
  className="border-2 border-blue-500"
  placeholder="Custom styled combobox"
/>
```

### Disabled State

```svelte
<Combobox
  bind:value={selectedValue}
  {items}
  disabled={true}
  placeholder="This is disabled"
/>
```

## Integration with Forms

The combobox includes a hidden input that automatically submits the selected value when used in forms. Simply provide the `name` prop:

```svelte
<script lang="ts">
  import { Combobox } from '$lib/components/ui-custom';
  import { superForm } from 'sveltekit-superforms';
  
  const { form, enhance } = superForm(data.form);
  
  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' }
  ];
</script>

<form method="POST" use:enhance>
  <Combobox
    bind:value={$form.category}
    items={categories}
    name="category"
    label="Category"
    placeholder="Select a category"
    required={true}
  />
  <button type="submit">Submit</button>
</form>
```

### Form Validation

When using the `required` prop, the combobox will:
- Display an asterisk (*) next to the label
- Set `aria-required="true"` for accessibility
- Include the `required` attribute on the hidden input

## Accessibility

The component follows WAI-ARIA combobox patterns:

- Proper ARIA attributes (`role="combobox"`, `aria-expanded`)
- Keyboard navigation support
- Screen reader compatibility
- Focus management after selection

## Styling

The component uses Tailwind CSS classes and can be customized through:

1. The `className` prop for the trigger button
2. Overriding the default styles in your CSS
3. Using CSS variables for theming

## Dependencies

- Svelte 5 (runes)
- Bits UI components
- Lucide Svelte icons
- Tailwind CSS