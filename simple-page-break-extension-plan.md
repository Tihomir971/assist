# Simple Tiptap Page Break Extension

## Overview
A minimal page break extension for Tiptap that creates invisible page breaks for printing.

## 1. Create the Extension

**File: `src/lib/tiptap/extensions/page-break.ts`**

```typescript
import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',
  
  group: 'block',
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ];
  },

  renderHTML() {
    return [
      'div',
      {
        'data-type': 'page-break',
        class: 'page-break',
      },
    ];
  },

  addCommands() {
    return {
      insertPageBreak: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
        });
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.insertPageBreak(),
    };
  },
});

export default PageBreak;
```

## 2. CSS Styles

**Add to your CSS file:**

```css
/* Page break - visible in editor */
.page-break {
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px dashed #ccc;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  background: #f9f9f9;
}

.page-break::before {
  content: 'Page Break';
}

/* Page break - invisible in print but forces page break */
@media print {
  .page-break {
    page-break-after: always;
    break-after: page;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    visibility: hidden;
    height: 0;
  }
  
  .page-break::before {
    display: none;
  }
}
```

## 3. Usage in Edra Editor

**File: `src/lib/edra/editor.ts`**

```typescript
import { PageBreak } from '$lib/tiptap/extensions/page-break.js';

// Add to extensions array:
PageBreak,
```

## 4. Add to Toolbar Commands

**File: `src/lib/edra/commands/toolbar-commands.ts`**

```typescript
import FileBreak from '@lucide/svelte/icons/file-break';

// Add to commands object:
'page-break': [
  {
    icon: FileBreak,
    name: 'pageBreak',
    tooltip: 'Insert Page Break',
    shortCut: `${isMac ? '⌘' : 'Ctrl+'}Enter`,
    onClick: (editor) => {
      editor.chain().focus().insertPageBreak().run();
    },
    clickable: (editor) => {
      return editor.can().insertPageBreak();
    }
  }
]
```

## Why This is Simple

1. **No complex HTML structure** - just a simple div
2. **CSS handles everything** - visual feedback in editor, invisible in print
3. **Reusable** - can be used in any Tiptap editor
4. **Standard page break behavior** - uses CSS `page-break-after: always`

## Usage

- **Keyboard**: Ctrl+Enter (Cmd+Enter on Mac)
- **Programmatic**: `editor.commands.insertPageBreak()`
- **Toolbar**: Add the page-break command group to your toolbar

The extension creates a simple div that shows "Page Break" in the editor but becomes invisible during printing while still forcing a page break.