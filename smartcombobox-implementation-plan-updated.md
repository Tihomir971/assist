# SmartCombobox Implementation Plan - Updated for Latest shadcn-svelte

## Overview

Based on the latest shadcn-svelte Combobox documentation and your demo form patterns, here's the correct implementation for `SmartCombobox` that integrates properly with `Form.Control`.

## Key Insights from Documentation

1. **Form Integration**: Uses `Form.Control` with `{#snippet children({ props })}` pattern
2. **Hidden Input**: Includes `<input hidden value={$formData.language} name={props.name} />` for form submission
3. **Props Passing**: Form props are passed via `{...props}` to the trigger button
4. **Focus Management**: Uses `closeAndFocusTrigger()` with `tick()` for proper keyboard navigation
5. **No Manual ARIA**: Form.Control handles accessibility attributes automatically

## Implementation Plan

### Step 1: Create SmartCombobox Component

**File:** `src/lib/components/forms/fields/SmartCombobox.svelte`

```svelte
<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import { tick } from "svelte";
	import * as Command from "$lib/components/ui/command/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import type { LookupOption } from '$lib/types/form-config.types';

	interface Props {
		value?: number | string | null;
		options: LookupOption[];
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		searchable?: boolean;
		onValueChange?: (value: number | string | null) => void;
		// Form props passed from Form.Control
		name?: string;
		[key: string]: any; // For other form props
	}

	let {
		value = $bindable(),
		options = [],
		placeholder = "Select an option...",
		disabled = false,
		readonly = false,
		searchable = true,
		onValueChange,
		...formProps
	}: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// Find the selected option
	const selectedOption = $derived(
		options.find((option) => option.value === value)
	);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function selectOption(optionValue: number | string | null) {
		value = optionValue;
		onValueChange?.(optionValue);
		closeAndFocusTrigger();
	}

	function clearSelection() {
		selectOption(null);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				{...formProps}
				variant="outline"
				class={cn(
					"w-full justify-between",
					!selectedOption && "text-muted-foreground"
				)}
				role="combobox"
				aria-expanded={open}
				{disabled}
			>
				{selectedOption?.label ?? placeholder}
				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-full p-0">
		<Command.Root>
			{#if searchable}
				<Command.Input placeholder="Search options..." class="h-9" />
			{/if}
			<Command.List>
				<Command.Empty>No option found.</Command.Empty>
				<Command.Group>
					{#if value !== null && value !== undefined}
						<Command.Item
							value="__clear__"
							onSelect={clearSelection}
							class="text-muted-foreground"
						>
							<CheckIcon class="mr-2 size-4 opacity-0" />
							Clear selection
						</Command.Item>
					{/if}
					{#each options as option (option.value)}
						<Command.Item
							value={option.label}
							onSelect={() => selectOption(option.value)}
						>
							<CheckIcon
								class={cn(
									"mr-2 size-4",
									value !== option.value && "text-transparent"
								)}
							/>
							<div class="flex flex-col">
								<span>{option.label}</span>
								{#if option.description}
									<span class="text-xs text-muted-foreground">
										{option.description}
									</span>
								{/if}
							</div>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<!-- Hidden input for form submission - follows shadcn-svelte pattern -->
<input hidden value={value ?? ''} name={formProps.name} />
```

### Step 2: Update SmartField Component

**File:** `src/lib/components/forms/SmartField.svelte`

Add SmartCombobox import and field type detection:

```svelte
<script lang="ts">
	// ... existing imports
	import SmartCombobox from './fields/SmartCombobox.svelte';

	// ... existing code

	// Enhanced field type detection
	const fieldType = $derived.by(() => {
		// Check for explicit options in field override - use combobox for searchable dropdowns
		if (fieldOverride?.options && fieldOverride.options.length > 0) {
			// Use combobox for searchable dropdowns, select for simple ones
			return fieldOverride.searchable !== false ? 'combobox' : 'select';
		}

		// ... existing field type logic for other types
		
		return 'text'; // fallback
	});
</script>

<!-- In the field rendering section -->
<Form.Field form={superformInstance} name={fieldName}>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>{fieldOverride?.label || fieldName}</Form.Label>
			
			{#if fieldType === 'combobox'}
				<SmartCombobox
					bind:value={fieldValue}
					options={fieldOverride?.options || []}
					placeholder={fieldOverride?.placeholder}
					disabled={fieldOverride?.readonly || disabled}
					searchable={fieldOverride?.searchable !== false}
					{...props}
					onValueChange={(newValue) => {
						fieldValue = newValue;
						onFieldChange?.(fieldName, newValue);
					}}
				/>
			{:else if fieldType === 'select'}
				<!-- Keep existing SmartSelect for simple dropdowns -->
				<SmartSelect
					bind:value={fieldValue}
					options={fieldOverride?.options || []}
					placeholder={fieldOverride?.placeholder}
					disabled={fieldOverride?.readonly || disabled}
					{...props}
					onValueChange={(newValue) => {
						fieldValue = newValue;
						onFieldChange?.(fieldName, newValue);
					}}
				/>
			{:else if fieldType === 'text'}
				<SmartInput
					bind:value={fieldValue}
					placeholder={fieldOverride?.placeholder}
					disabled={fieldOverride?.readonly || disabled}
					{...props}
					onValueChange={(newValue) => {
						fieldValue = newValue;
						onFieldChange?.(fieldName, newValue);
					}}
				/>
			<!-- ... other field types -->
			{/if}
		{/snippet}
	</Form.Control>
	
	{#if fieldOverride?.description}
		<Form.Description>{fieldOverride.description}</Form.Description>
	{/if}
	<Form.FieldErrors />
</Form.Field>
```

### Step 3: Update Category Form Configuration

**File:** `src/routes/(app)/catalog/category/[[id]]/+page.svelte`

Update the `parent_id` field configuration to use combobox:

```typescript
const categoryFormConfig = {
	// ... existing config
	fieldOverrides: {
		// ... existing fields
		parent_id: {
			label: 'Parent Category',
			placeholder: 'Select a parent category',
			description: 'Choose the parent category (optional)',
			searchable: true, // This will trigger combobox instead of select
			options: data.categories.map((cat: any) => ({
				value: cat.value,
				label: cat.label,
				description: cat.description || undefined
			}))
		},
		// ... rest of fields
	}
};
```

### Step 4: Update Type Definitions

**File:** `src/lib/types/form-config.types.ts`

Ensure the types support combobox configuration:

```typescript
export interface FieldOverride {
	label?: string;
	placeholder?: string;
	description?: string;
	options?: LookupOption[]; // For combobox/select fields
	hidden?: boolean;
	readonly?: boolean;
	searchable?: boolean; // true = combobox, false = select
	// ... existing properties
}

export interface LookupOption {
	value: number | string;
	label: string;
	description?: string;
}
```

## Key Differences from Previous Plan

### ✅ Correct Form Integration
- Uses `Form.Control` with `{#snippet children({ props })}` pattern
- Passes form props via `{...props}` to the trigger button
- Includes hidden input following shadcn-svelte pattern
- No manual ARIA attributes needed

### ✅ Proper Focus Management
- Uses `closeAndFocusTrigger()` with `tick()` for keyboard navigation
- Maintains focus on trigger after selection

### ✅ Simplified Props
- No manual `id`, `aria-describedby`, `aria-invalid` props
- Form.Control handles all accessibility automatically
- Clean separation of form props vs component props

### ✅ Consistent with Demo Pattern
- Follows the exact pattern from your demo form
- Matches shadcn-svelte documentation examples
- Integrates seamlessly with existing SmartForm system

## Usage Example

After implementation, your category form will automatically render the `parent_id` field as a searchable combobox:

```svelte
<!-- This configuration automatically creates a combobox -->
parent_id: {
	label: 'Parent Category',
	placeholder: 'Select a parent category',
	description: 'Choose the parent category (optional)',
	searchable: true, // Key: this triggers combobox vs select
	options: data.categories.map((cat: any) => ({
		value: cat.value,
		label: cat.label,
		description: cat.description
	}))
}
```

## Benefits

### ✅ Seamless Integration
- Works perfectly with existing SmartForm system
- No changes needed to `createSimpleCRUD` backend
- Maintains all existing functionality

### ✅ Proper Accessibility
- Full keyboard navigation support
- Automatic ARIA attributes via Form.Control
- Screen reader friendly

### ✅ Consistent Styling
- Matches shadcn-svelte design system
- Consistent with other form fields
- Responsive and mobile-friendly

### ✅ Search Functionality
- Built-in search/filter capability
- Configurable via `searchable` property
- Clear selection option

This implementation will complete your SmartForm system with proper combobox support for the `parent_id` field while maintaining the simplicity of your `createSimpleCRUD` backend approach and following the latest shadcn-svelte patterns.