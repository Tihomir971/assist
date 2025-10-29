# useDataTable Composable

The `useDataTable` composable provides a reusable way to create reactive TanStack tables with common functionality. It extracts the table logic to make it reusable across different components.

## Features

- Reactive table state management
- Built-in support for sorting, filtering, and row selection
- Column visibility controls
- Type-safe implementation with TypeScript
- Flexible row ID generation
- Customizable filter functions

## Usage

### Basic Usage

```typescript
import { useDataTable } from '$lib/composables/useDataTable';

// In your component
const { table, globalFilterTableState, rowSelectionState, sortingState, visibilityState } = 
  useDataTable({
    columns: yourColumns,
    data: yourData,
    getRowId: (row) => row.id.toString()
  });
```

### With Custom Options

```typescript
import { useDataTable } from '$lib/composables/useDataTable';

const { table } = useDataTable({
  columns: yourColumns,
  data: yourData,
  getRowId: (row) => `item-${row.id}`,
  globalFilterFn: (row, columnId, filterValue) => {
    // Custom filter logic
    return row[columnId].toString().toLowerCase().includes(filterValue.toLowerCase());
  }
});
```

## API Reference

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | `ColumnDef<TData>[]` | (required) | Table column definitions |
| `data` | `TData[]` | (required) | Table data |
| `getRowId` | `(row: TData) => string` | Auto-generated | Function to get unique row ID |
| `globalFilterFn` | `string \| FilterFn<TData>` | `'includesString'` | Global filter function |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `table` | `Table<TData>` | The reactive TanStack table instance |
| `globalFilterTableState` | `GlobalFilterTableState \| undefined` | Current global filter state |
| `rowSelectionState` | `RowSelectionState` | Current row selection state |
| `sortingState` | `SortingState` | Current sorting state |
| `visibilityState` | `VisibilityState` | Current column visibility state |

## Examples

### Simple Data Table Component

```svelte
<script lang="ts">
  import { type ColumnDef } from '@tanstack/table-core';
  import { FlexRender } from '$lib/components/ui/data-table/index.js';
  import { useDataTable } from '$lib/composables/useDataTable';
  import * as Table from '$lib/components/ui/table/index.js';

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'role',
      header: 'Role'
    }
  ];

  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
  ];

  const { table } = useDataTable({
    columns,
    data: users
  });
</script>

<div class="rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head colspan={header.colSpan}>
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row data-state={row.getIsSelected() && 'selected'}>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
```

### Advanced Example with Custom Row ID

```typescript
// For objects without an 'id' property
const { table } = useDataTable({
  columns: yourColumns,
  data: complexData,
  getRowId: (row) => {
    // Use multiple fields to create a unique ID
    return `${row.type}-${row.identifier}-${row.version}`;
  }
});
```

## Migration from Original Component

If you're migrating from the original data table component:

1. Import the composable:
   ```typescript
   import { useDataTable } from '$lib/composables/useDataTable';
   ```

2. Replace the table creation logic:
   ```typescript
   // Before
   let globalFilterTableState = $state<GlobalFilterTableState>();
   let rowSelectionState: RowSelectionState = $state({});
   // ... more state setup
   
   const table = createSvelteTable({ /* complex config */ });
   
   // After
   const { table } = useDataTable({
     columns,
     data,
     getRowId: (row) => row.id.toString()
   });
   ```

3. Your template code remains the same!

## Benefits

1. **Reusability**: Use the same table logic across multiple components
2. **Type Safety**: Full TypeScript support with proper typing
3. **Reduced Boilerplate**: Less code to write and maintain
4. **Consistency**: Standardized table behavior across your app
5. **Flexibility**: Easy to customize and extend
6. **Testing**: Easier to test table logic in isolation

## Related Components

- `DataTable.svelte` - Original component (now uses the composable)
- `SimpleDataTable.svelte` - Example of how to create custom table components