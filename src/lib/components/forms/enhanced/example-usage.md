# Enhanced Forms Usage Example

This demonstrates how to use the new enhanced forms components with props spreading, similar to shadcn-svelte's pattern.

## Compact Usage (Like shadcn-svelte)

```svelte
<script lang="ts">
  import { 
    EnhancedFormField, 
    FormControl, 
    FormLabel, 
    FormDescription, 
    FormFieldErrors, 
    EnhancedCombobox 
  } from '$lib/components/forms';
  import { superForm } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { z } from 'zod';

  const schema = z.object({
    category: z.number().nullable().default(null)
  });

  const form = superForm(zod(schema));
  const { form: formData, enhance } = form;

  const categories = [
    { value: 1, label: 'Electronics' },
    { value: 2, label: 'Books' },
    { value: 3, label: 'Clothing' },
  ];
</script>

<form method="POST" use:enhance>
  <EnhancedFormField {form} name="category">
      <FormControl>
        {#snippet children({ props })}
          <FormLabel>
            Category
          </FormLabel>
          
          <EnhancedCombobox 
            {...props} 
            options={categories} 
            placeholder="Select a category"
            bind:value={$formData.category}
          />
        {/snippet}
      </FormControl>
      
      <FormDescription>
        Choose the product category
      </FormDescription>
      
      <FormFieldErrors  />
    {/snippet}
  </EnhancedFormField>
  
  <button type="submit">Submit</button>
</form>
```

## How it works

1. **EnhancedFormField** - Generates unique IDs and provides complete field context:
   ```js
   fieldContext = {
     constraints, errors, tainted, value,
     ids: {
       input: "formsnap-1",        // Input element ID
       label: "formsnap-1-label",  // Label element ID  
       description: "formsnap-1-desc", // Description element ID
       error: "formsnap-1-error"   // Error element ID
     }
   }
   ```

2. **FormControl** - Receives field context and generates HTML attributes:
   - Uses `fieldContext.ids.input` for input `id` and `name`
   - References `fieldContext.ids.description` and `fieldContext.ids.error` in `aria-describedby`
   - Uses `fieldContext.constraints` and `fieldContext.errors` for validation states

3. **FormLabel** - Automatically uses:
   - `id={fieldContext.ids.label}` for its own ID
   - `for={fieldContext.ids.input}` to associate with the input

4. **FormDescription** - Automatically uses:
   - `id={fieldContext.ids.description}` for proper aria-describedby reference

5. **FormFieldErrors** - Automatically uses:
   - `id={fieldContext.ids.error}` for proper aria-describedby reference
   - `fieldContext.errors` for error display

## Generated ID Structure

For each field, the following IDs are automatically generated:
- Input: `formsnap-1`
- Label: `formsnap-1-label`  
- Description: `formsnap-1-desc`
- Error: `formsnap-1-error`

This matches the formsnap ID generation pattern exactly.

## Accessibility Features

The components automatically create proper accessibility relationships:
- Label `for` attribute points to input ID (`formsnap-1`)
- Input `aria-describedby` references description and error IDs (`formsnap-1-desc formsnap-1-error`)
- Error messages are properly associated with the input

## Key Benefits

- **Automatic ID management**: No manual ID passing required
- **Proper ID generation**: Matches formsnap's ID pattern (formsnap-X)
- **No context**: Everything passed via props/snippets
- **Clean separation**: Form state → prop generation → UI components
- **Zag.js integration**: Props go to `useMachine`, Zag handles the rest
- **Type safe**: Full TypeScript support with proper `Snippet<[T]>` types
- **Accessible**: Proper ARIA attributes and ID relationships automatically
- **Flexible**: Can be used with any input component that accepts the generated props

## Comparison with shadcn-svelte

**shadcn-svelte:**
```svelte
<Form.Field {form} name="username">
  <Form.Control>
    {#snippet children({ props })}
      <Form.Label>Username</Form.Label>
      <Input {...props} bind:value={$formData.username} />
    {/snippet}
  </Form.Control>
  <Form.Description>This is your public display name.</Form.Description>
  <Form.FieldErrors />
</Form.Field>
```

**Our enhanced version:**
```svelte
<EnhancedFormField {form} name="category">
  {#snippet children(fieldContext)}
    <FormControl {fieldContext}>
      {#snippet children({ props })}
        <FormLabel {fieldContext}>Category</FormLabel>
        <EnhancedCombobox {...props} options={categories} bind:value={$formData.category} />
      {/snippet}
    </FormControl>
    <FormDescription {fieldContext}>Choose the product category</FormDescription>
    <FormFieldErrors {fieldContext} />
  {/snippet}
</EnhancedFormField>
```

The patterns are nearly identical! The main difference is that our components receive the `fieldContext` prop which contains all the form state and generated IDs, providing complete control and proper accessibility automatically.
