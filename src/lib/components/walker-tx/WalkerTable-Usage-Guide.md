# WalkerTable Component Usage Guide

The `WalkerTable` component is a Svelte 5 wrapper around TanStack Table that provides a complete data table solution with sorting, selection, and flexible cell rendering.

## Overview

`WalkerTable` is located at `src/lib/components/walker-tx/WalkerTable.svelte` and provides:

- **Sortable columns** with visual indicators
- **Row selection** with checkbox support
- **Flexible cell rendering** using components or snippets
- **Responsive design** with sticky headers/footers
- **TanStack Table integration** with Svelte 5 reactivity

## Basic Usage

### 1. Create Table Instance

First, create a TanStack table instance using the provided utilities:

```typescript
// In your +page.svelte
import { createSvelteTable } from '$lib/components/walker-tx';
import type { ColumnDef } from '@tanstack/table-core';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

const table = createSvelteTable({
  data: users,
  columns,
  getRowId: (row) => row.id.toString(),
});
```

### 2. Use WalkerTable Component

```svelte
<!-- In your +page.svelte -->
<script lang="ts">
  import WalkerTable from '$lib/components/walker-tx/WalkerTable.svelte';
  import { createSvelteTable } from '$lib/components/walker-tx';
  // ... table setup code
</script>

<WalkerTable table={table} />
```

## Column Definitions

### Basic Column Types

```typescript
const columns: ColumnDef<User>[] = [
  // Simple text column
  {
    accessorKey: 'name',
    header: 'Full Name',
  },

  // Number column
  {
    accessorKey: 'age',
    header: 'Age',
    cell: ({ getValue }) => getValue().toString(),
  },

  // Boolean column
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: ({ getValue }) => getValue() ? 'Yes' : 'No',
  },
];
```

### Custom Header and Cell Content

```typescript
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => `Name (${column.getFacetedUniqueValues().size})`,
    cell: ({ getValue, row }) => {
      const name = getValue();
      return name.toUpperCase();
    },
  },
];
```

## Advanced Cell Rendering

### Using Svelte Components

To render Svelte components in table cells, use the `renderComponent` helper function:

```typescript
// Create a custom action button component
<!-- AddProductButton.svelte -->
<script lang="ts">
  import PhPlus from '~icons/ph/plus';
  import { Button } from '$lib/components/ui/button';

  let { product, onAdd }: { product: Product; onAdd: (product: Product) => void } = $props();
</script>

<Button
  variant="default"
  size="icon"
  onclick={() => onAdd(product)}
  class="size-8 p-0"
>
  <span class="sr-only">Add product</span>
  <PhPlus />
</Button>
```

```typescript
// Use in column definition
import AddProductButton from './AddProductButton.svelte';
import { renderComponent } from '$lib/components/walker-tx';

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => renderComponent(AddProductButton, {
      product: row.original,
      onAdd: handleAddProduct
    }),
    enableColumnFilter: false,
    enableSorting: false,
  },
];
```

### Action Button Components

For tables with action buttons (edit, delete, add, etc.), create dedicated components:

```typescript
// DataTableActions.svelte
<script lang="ts">
  import PhDotsThreeBold from '~icons/ph/dots-three-bold';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let { id }: { id: string } = $props();
</script>

<Button
  variant="ghost"
  size="icon"
  onclick={() => {
    goto(`/catalog/products/edit/${id}?${page.url.searchParams}`);
  }}
  class="relative size-8 p-0"
>
  <span class="sr-only">Edit product</span>
  <PhDotsThreeBold />
</Button>
```

```typescript
// Use in column definition
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'id',
    header: '',
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { id: row.original.id.toString() });
    },
    enableSorting: false,
    enableHiding: false
  }
];
```

### Using Snippets

```typescript
// Create a custom cell component
<!-- StatusCell.svelte -->
<script lang="ts">
  import type { CellContext } from '@tanstack/table-core';

  type Props = CellContext<User, User['status']>;

  let { getValue }: Props = $props();
  const status = getValue();
</script>

<div class="flex items-center gap-2">
  <div class="w-2 h-2 rounded-full {status === 'active' ? 'bg-green-500' : 'bg-red-500'}"></div>
  {status}
</div>
```

```typescript
// Use in column definition
import StatusCell from './StatusCell.svelte';
import { renderComponent } from '$lib/components/walker-tx';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => renderComponent(StatusCell, { cell }),
  },
];
```

### Using Snippets

```svelte
<!-- In your +page.svelte -->
<script lang="ts">
  import { renderSnippet } from '$lib/components/walker-tx';

  // Define a snippet for custom rendering
  const statusSnippet = $snippet(statusParams => {
    const { status } = statusParams;
    return `<div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}"></div>
      ${status}
    </div>`;
  });
</script>

{#snippet statusCell(cell)}
  {@const status = cell.getValue()}
  {@render statusSnippet({ status })}
{/snippet}

<!-- In column definition -->
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ cell }) => renderSnippet(statusCell, cell),
}
```

## Sorting

WalkerTable includes built-in sorting functionality:

```typescript
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <button onClick={column.getToggleSortingHandler()}>
        Name
        {#if column.getIsSorted() === 'asc'} ↑
        {:else if column.getIsSorted() === 'desc'} ↓
        {:else} ↕{/if}
      </button>
    ),
    sortingFn: 'text', // or 'basic', 'datetime', etc.
  },
];
```

## Row Selection

Enable row selection in your table configuration:

```typescript
const table = createSvelteTable({
  data: users,
  columns,
  enableRowSelection: true,
  onRowSelectionChange: (updater) => {
    // Handle selection changes
    console.log('Selection changed:', updater);
  },
});
```

Use the selection information in your UI:

```svelte
<script lang="ts">
  let { table } = $props();

  $effect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    console.log('Selected users:', selectedRows.map(row => row.original));
  });
</script>

<div class="mb-4">
  <p>{table.getSelectedRowModel().rows.length} of {table.getRowCount()} selected</p>
</div>
```

## Integration with Smart List Pattern

WalkerTable works seamlessly with the Smart List Page pattern:

```typescript
// datatable.config.ts
import { columnTypes } from '$lib/utils/data-table-config.builder';

export const userTableConfig = new DataTableConfigBuilder<User>()
  .title('Users')
  .columns([
    columnTypes.hiddenId('id'),
    columnTypes.text('name', 'Full Name'),
    columnTypes.text('email', 'Email'),
    columnTypes.boolean('isActive', 'Active'),
  ])
  .createButton('Create User', '/users/edit')
  .mode('client') // or 'server'
  .build();
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import WalkerTable from '$lib/components/walker-tx/WalkerTable.svelte';
  import { createSvelteTable } from '$lib/components/walker-tx';

  let { data } = $props();

  const table = createSvelteTable({
    data: data.items,
    columns: userTableConfig.columns,
    // ... other options
  });
</script>

<WalkerTable {table} />
```

## Styling and Theming

WalkerTable uses the existing UI table components:

```svelte
<!-- Custom styling -->
<WalkerTable table={table} class="custom-table-class" />
```

The component includes:
- Sticky headers and footers
- Hover states
- Selection highlighting
- Responsive design

## Complete Example

Here's a complete example showing WalkerTable with all features:

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import WalkerTable from '$lib/components/walker-tx/WalkerTable.svelte';
  import { createSvelteTable, renderComponent } from '$lib/components/walker-tx';
  import StatusCell from './StatusCell.svelte';
  import * as Table from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';

  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
  }

  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'inStock',
      header: 'Status',
      cell: ({ cell }) => renderComponent(StatusCell, { cell }),
    },
  ];

  const table = createSvelteTable({
    data: products,
    columns,
    enableRowSelection: true,
    enableSorting: true,
  });

  function handleBulkAction() {
    const selected = table.getSelectedRowModel().rows;
    console.log('Selected products:', selected.map(row => row.original));
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h2>Products</h2>
    <Button onClick={handleBulkAction}>
      Bulk Update ({table.getSelectedRowModel().rows.length})
    </Button>
  </div>

  <WalkerTable {table} />
</div>
```

## Best Practices

1. **Use TypeScript**: Always define proper types for your data and columns
2. **Optimize rendering**: Use `renderComponent` and `renderSnippet` for complex cells
3. **Handle large datasets**: Consider pagination for large data sets
4. **Accessibility**: Ensure proper ARIA labels for custom components
5. **Performance**: Use `getRowId` for stable row identities

## Troubleshooting

### Common Issues

**Sorting not working:**
- Ensure `enableSorting: true` in table options
- Check that column accessor keys match your data structure

**Selection not working:**
- Verify `enableRowSelection: true` is set
- Check that rows have stable IDs via `getRowId`

**Custom components not rendering:**
- Use `renderComponent` helper for Svelte components
- Ensure component props are properly typed

## API Reference

### WalkerTable Props

```typescript
type Props = {
  table: TanstackTable<T>;
  class?: string; // Additional CSS classes
};
```

### createSvelteTable Options

```typescript
interface TableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  onRowSelectionChange?: (updater: Updater<RowSelectionState>) => void;
  // ... other TanStack Table options
}
```

For more advanced usage, refer to the [TanStack Table documentation](https://tanstack.com/table).