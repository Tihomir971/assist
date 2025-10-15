# Reusable TreeView Component

A typed, reusable TreeView component built with Ark UI for Svelte 5. This component uses the exact same CSS classes as the original basic.svelte implementation.

## Features

- **TypeScript Support**: Fully typed with generic node support
- **Ark UI Integration**: Built on top of Ark UI's TreeView primitive
- **Customizable Icons**: Support for custom icon components
- **Consistent Styling**: Uses the same CSS classes as the original basic.svelte
- **Svelte 5 Runes**: Uses modern Svelte 5 syntax (no deprecated `<svelte:component>`)
- **Selection & Expansion**: Supports single/multiple selection and expandable nodes
- **Accessible**: Full keyboard navigation and screen reader support

## Usage

### Basic Usage

```svelte
<script lang="ts">
  import TreeView from '$lib/components/ark/tree-view/TreeView.svelte';
  import type { TreeViewNode } from '$lib/components/ark/tree-view/types';

  const data: TreeViewNode[] = [
    {
      id: 'folder1',
      name: 'Folder 1',
      children: [
        { id: 'file1', name: 'File 1.txt' },
        { id: 'file2', name: 'File 2.txt' }
      ]
    },
    { id: 'file3', name: 'File 3.txt' }
  ];
</script>

<TreeView items={data} label="My Files" />
```

### With Custom Icons

```svelte
<script lang="ts">
  import TreeView from '$lib/components/ark/tree-view/TreeView.svelte';
  import { FolderOpen, FolderClosed, File } from 'lucide/svelte';

  const customIcons = {
    folderClosed: FolderClosed,
    folderOpen: FolderOpen,
    file: File
  };
</script>

<TreeView
  items={data}
  label="Project Files"
  icons={customIcons}
/>
```

### With Selection

```svelte
<script lang="ts">
  let selectedNodes: string[] = [];
</script>

<TreeView
  items={data}
  label="Selectable Tree"
  selectionMode="multiple"
  bind:selectedValue={selectedNodes}
/>

<p>Selected: {selectedNodes.join(', ')}</p>
```

## Props

The TreeView component extends all props from Ark UI's TreeViewRootBaseProps, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeViewNode[]` | **Required** | Tree data structure |
| `label` | `string` | `undefined` | Optional label for the tree |
| `icons` | `Partial<TreeViewIcons>` | `undefined` | Custom icon components |

## Data Structure

```typescript
interface TreeViewNode<T = number | string> {
  id: T;
  name: string;
  children?: TreeViewNode<T>[] | undefined;
  icon?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}
```

## Styling

The component uses fixed CSS classes that match the original basic.svelte implementation:

- Container: `mx-auto w-full max-w-sm`
- Tree: `space-y-1 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900`
- Branch controls, items, and all other elements use the exact same classes as the original

## Examples

See the demo page at `/lab/tree-view-demo` for complete examples.

## Dependencies

- `@ark-ui/svelte`
- `@lucide/svelte` (for default icons)
- Svelte 5+

## Notes

- This component uses Svelte 5 runes syntax
- All Ark UI TreeView features are supported (selection, expansion, etc.)
- Icons are dynamic components - no deprecated `<svelte:component>` usage
- Full TypeScript support with proper generic constraints
- Styling is fixed to match the original implementation for consistency