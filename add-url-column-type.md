# Implementation Plan: Add `url` Column Type to Smart Related Table

This plan outlines the steps required to add a new `url` column type to the `createRelatedTableConfig` utility. This new type will render a clickable icon that opens a URL in a new browser tab.

## 1. Update Type Definitions

**File**: `src/lib/types/related-table-config.types.ts`

**Action**: Add `'url'` to the `type` property within the `ColumnDefinition<T>` interface to make the new column type available and type-safe.

**Current Code**:
```typescript
export interface ColumnDefinition<T extends Record<string, unknown>> {
	//...
	type?: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'lookup' | 'custom';
	//...
}
```

**Proposed Change**:
```typescript
export interface ColumnDefinition<T extends Record<string, unknown>> {
	//...
	type?: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'lookup' | 'custom' | 'url';
	//...
}
```

## 2. Extend the Column Type Builder

**File**: `src/lib/utils/related-table-config.builder.ts`

**Action**: Add a new `url` helper function to the `columnTypes` object. This will provide a declarative way to create URL columns.

**Proposed Addition**:
```typescript
// Add to the `columnTypes` object
url: <T extends Record<string, unknown>>(
    key: keyof T,
    label: string,
    options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> => ({
    key,
    label,
    type: 'url',
    sortable: false,
    searchable: false,
    width: '60px',
    ...options
}),
```

## 3. Create a Reusable `UrlCell` Component

**File**: `src/lib/components/forms/cells/UrlCell.svelte` (new file)

**Action**: Create a new Svelte component that will render the UI for the URL cell. It will display a link icon and open the provided URL in a new tab when clicked.

**Proposed Content**:
```svelte
<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	export let value: string | undefined | null;
</script>

{#if value}
	<a href={value} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>
		<Button variant="ghost" size="icon" class="h-8 w-8">
			<ExternalLink class="h-4 w-4" />
		</Button>
	</a>
{:else}
	<span />
{/if}
```

## 4. Integrate the `UrlCell` Component into the `SmartRelatedTable`

**File**: `src/lib/components/forms/SmartRelatedTable.svelte`

**Action**: I will first need to locate this file. Then, I will modify it to recognize the new `'url'` column type and render the `UrlCell.svelte` component when it encounters it.

**Plan**:
1.  Use the `list_files` tool to locate `SmartRelatedTable.svelte`.
2.  Read the file's content.
3.  Modify the component to import `UrlCell.svelte`.
4.  Update the template logic to conditionally render `UrlCell.svelte` for columns with `type: 'url'`.