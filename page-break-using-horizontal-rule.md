# Page Break Extension Using Horizontal Rule

## Overview
The simplest approach is to extend `@tiptap/extension-horizontal-rule` since it already handles most of the functionality we need.

## 1. Create the Extension

**File: `src/lib/tiptap/extensions/page-break.ts`**

```typescript
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = HorizontalRule.extend({
  name: 'pageBreak',

  renderHTML() {
    return [
      'hr',
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
hr.page-break {
  border: none;
  border-top: 2px dashed #ccc;
  margin: 2rem 0;
  position: relative;
  background: none;
}

hr.page-break::after {
  content: 'Page Break';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0 0.5rem;
  color: #666;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Page break - forces page break in print */
@media print {
  hr.page-break {
    page-break-after: always;
    break-after: page;
    margin: 0;
    border: none;
    visibility: hidden;
    height: 0;
  }
  
  hr.page-break::after {
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

## Why This Approach is Better

1. **Leverages existing functionality** - HorizontalRule already handles parsing, rendering, and basic behavior
2. **Less code** - We only override what we need to change
3. **More reliable** - Built on a well-tested foundation
4. **Semantic HTML** - Uses `<hr>` which is semantically correct for breaks
5. **Better compatibility** - Works with all Tiptap features out of the box

## Alternative: Even Simpler Approach

If you want the absolute simplest solution, you can just use the regular HorizontalRule with custom CSS:

**File: `src/lib/edra/editor.ts`**

```typescript
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

// In extensions array:
HorizontalRule.configure({
  HTMLAttributes: {
    class: 'page-break',
  },
}),
```

Then use the same CSS as above. Users would insert page breaks using the regular horizontal rule command, but it would behave as a page break in print.

## Recommendation

I recommend the **extended HorizontalRule approach** because:
- It gives you a dedicated `insertPageBreak()` command
- Clear separation between regular HR and page breaks
- Custom keyboard shortcut (Ctrl+Enter)
- More explicit in intent and usage

The extension is minimal but provides the exact functionality you need while building on Tiptap's solid foundation.