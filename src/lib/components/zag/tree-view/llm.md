# Tree View

The TreeView component provides a hierarchical view of data, similar to a file
system explorer. It allows users to expand and collapse branches, select
individual or multiple nodes, and traverse the hierarchy using keyboard
navigation.

## Resources


[Latest version: v1.12.0](https://www.npmjs.com/package/@zag-js/tree-view)
[Logic Visualizer](https://zag-visualizer.vercel.app/tree-view)
[Source Code](https://github.com/chakra-ui/zag/tree/main/packages/machines/tree-view)



**Features**

- Display hierarchical data in a tree structure
- Expand or collapse nodes
- Support for keyboard navigation
- Select single or multiple nodes (depending on the selection mode)
- Perform actions on the nodes, such as deleting them or performing some other
  operation

## Installation

To use the tree view machine in your project, run the following command in your
command line:



## Anatomy

To set up the tree view correctly, you'll need to understand its anatomy.



## Usage

First, import the tree view package into your project

```jsx
import * as tree from "@zag-js/tree-view"
```

The tree view package exports two key functions:

- `machine` â€” The state machine logic for the tree view widget.
- `connect` â€” The function that translates the machine's state to JSX attributes
  and event handlers.

Next, import the required hooks and functions for your framework and use the
tree view machine in your project ðŸ”¥

### Create the tree collection

Use the `collection` function to create a tree collection. This create a tree
factory that the component uses for traversal.

```ts
import * as tree from "@zag-js/tree-view"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const collection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "node_modules",
        name: "node_modules",
        children: [
          { id: "node_modules/zag-js", name: "zag-js" },
          { id: "node_modules/pandacss", name: "panda" },
          {
            id: "node_modules/@types",
            name: "@types",
            children: [
              { id: "node_modules/@types/react", name: "react" },
              { id: "node_modules/@types/react-dom", name: "react-dom" },
            ],
          },
        ],
      },
    ],
  },
})
```

### Create the tree view

Pass the tree collection to the machine to create the tree view.



### Expanding and Collapsing Nodes

By default, the tree view will expand or collapse when clicking the branch
control. To control the expanded state of the tree view, use the `api.expand`
and `api.collapse` methods.

```tsx
api.expand(["node_modules/pandacss"]) // expand a single node
api.expand() // expand all nodes

api.collapse(["node_modules/pandacss"]) // collapse a single node
api.collapse() // collapse all nodes
```

### Multiple selection

The tree view supports multiple selection. To enable this, set the
`selectionMode` to `multiple`.

```tsx {2}
const service = useMachine(tree.machine, {
  selectionMode: "multiple",
})
```

### Setting the default expanded nodes

To set the default expanded nodes, use the `expandedValue` context property.

```tsx {2}
const service = useMachine(tree.machine, {
  defaultExpandedValue: ["node_modules/pandacss"],
})
```

### Setting the default selected nodes

To set the default selected nodes, use the `selectedValue` context property.

```tsx {2}
const service = useMachine(tree.machine, {
  defaultSelectedValue: ["node_modules/pandacss"],
})
```

### Indentation Guide

When rendering a branch node in the tree view, you can render the `indentGuide`
element by using the `api.getBranchIndentGuideProps()` function.

```tsx {9}
<div {...api.getBranchProps(nodeProps)}>
  <div {...api.getBranchControlProps(nodeProps)}>
    <FolderIcon />
    {node.name}
    <span {...api.getBranchIndicatorProps(nodeProps)}>
      <ChevronRightIcon />
    </span>
  </div>
  <div {...api.getBranchContentProps(nodeProps)}>
    <div {...api.getBranchIndentGuideProps(nodeProps)} />
    {node.children.map((childNode, index) => (
      <TreeNode
        key={childNode.id}
        node={childNode}
        indexPath={[...indexPath, index]}
        api={api}
      />
    ))}
  </div>
</div>
```

### Listening for selection

When a node is selected, the `onSelectionChange` callback is invoked with the
selected nodes.

```jsx {2-5}
const service = useMachine(tree.machine, {
  onSelectionChange(details) {
    console.log("selected nodes:", details)
  },
})
```

### Listening for expanding and collapsing

When a node is expanded or collapsed, the `onExpandedChange` callback is invoked
with the expanded nodes.

```jsx {2-5}
const service = useMachine(tree.machine, {
  onExpandedChange(details) {
    console.log("expanded nodes:", details)
  },
})
```

## Methods and Properties

### Machine Context

The tree view machine exposes the following context properties:

**`collection`**
Type: `TreeCollection<T>`
Description: The tree collection data

**`ids`**
Type: `Partial<{ root: string; tree: string; label: string; node(value: string): string; }>`
Description: The ids of the tree elements. Useful for composition.

**`expandedValue`**
Type: `string[]`
Description: The controlled expanded node ids

**`defaultExpandedValue`**
Type: `string[]`
Description: The initial expanded node ids when rendered.
Use when you don't need to control the expanded node ids.

**`selectedValue`**
Type: `string[]`
Description: The controlled selected node ids

**`defaultSelectedValue`**
Type: `string[]`
Description: The initial selected node ids when rendered.
Use when you don't need to control the selected node ids.

**`focusedValue`**
Type: `string`
Description: The id of the focused node

**`selectionMode`**
Type: `"single" | "multiple"`
Description: Whether the tree supports multiple selection
- "single": only one node can be selected
- "multiple": multiple nodes can be selected

**`onExpandedChange`**
Type: `(details: ExpandedChangeDetails) => void`
Description: Called when the tree is opened or closed

**`onSelectionChange`**
Type: `(details: SelectionChangeDetails) => void`
Description: Called when the selection changes

**`onFocusChange`**
Type: `(details: FocusChangeDetails) => void`
Description: Called when the focused node changes

**`expandOnClick`**
Type: `boolean`
Description: Whether clicking on a branch should open it or not

**`typeahead`**
Type: `boolean`
Description: Whether the tree supports typeahead search

**`dir`**
Type: `"ltr" | "rtl"`
Description: The document's text/writing direction.

**`id`**
Type: `string`
Description: The unique identifier of the machine.

**`getRootNode`**
Type: `() => ShadowRoot | Node | Document`
Description: A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron.

### Machine API

The tree view `api` exposes the following methods:

**`collection`**
Type: `TreeCollection<V>`
Description: The tree collection data

**`expandedValue`**
Type: `string[]`
Description: The id of the expanded nodes

**`setExpandedValue`**
Type: `(value: string[]) => void`
Description: Function to set the expanded value

**`selectedValue`**
Type: `string[]`
Description: The id of the selected nodes

**`setSelectedValue`**
Type: `(value: string[]) => void`
Description: Function to set the selected value

**`getVisibleNodes`**
Type: `() => V[]`
Description: Function to get the visible nodes

**`expand`**
Type: `(value?: string[]) => void`
Description: Function to expand nodes.
If no value is provided, all nodes will be expanded

**`collapse`**
Type: `(value?: string[]) => void`
Description: Function to collapse nodes
If no value is provided, all nodes will be collapsed

**`select`**
Type: `(value?: string[]) => void`
Description: Function to select nodes
If no value is provided, all nodes will be selected

**`deselect`**
Type: `(value?: string[]) => void`
Description: Function to deselect nodes
If no value is provided, all nodes will be deselected

**`focus`**
Type: `(value: string) => void`
Description: Function to focus an item node

**`selectParent`**
Type: `(value: string) => void`
Description: Function to select the parent node of the focused node

**`expandParent`**
Type: `(value: string) => void`
Description: Function to expand the parent node of the focused node

### Data Attributes

**`Item`**

**`data-scope`**: tree-view
**`data-part`**: item
**`data-path`**: The path of the item
**`data-value`**: The value of the item
**`data-focus`**: Present when focused
**`data-selected`**: Present when selected
**`data-disabled`**: Present when disabled
**`data-depth`**: The depth of the item

**`ItemText`**

**`data-scope`**: tree-view
**`data-part`**: item-text
**`data-disabled`**: Present when disabled
**`data-selected`**: Present when selected
**`data-focus`**: Present when focused

**`ItemIndicator`**

**`data-scope`**: tree-view
**`data-part`**: item-indicator
**`data-disabled`**: Present when disabled
**`data-selected`**: Present when selected
**`data-focus`**: Present when focused

**`Branch`**

**`data-scope`**: tree-view
**`data-part`**: branch
**`data-depth`**: The depth of the item
**`data-branch`**: 
**`data-value`**: The value of the item
**`data-path`**: The path of the item
**`data-selected`**: Present when selected
**`data-state`**: "open" | "closed"
**`data-disabled`**: Present when disabled

**`BranchIndicator`**

**`data-scope`**: tree-view
**`data-part`**: branch-indicator
**`data-state`**: "open" | "closed"
**`data-disabled`**: Present when disabled
**`data-selected`**: Present when selected
**`data-focus`**: Present when focused

**`BranchTrigger`**

**`data-scope`**: tree-view
**`data-part`**: branch-trigger
**`data-disabled`**: Present when disabled
**`data-state`**: "open" | "closed"
**`data-value`**: The value of the item

**`BranchControl`**

**`data-scope`**: tree-view
**`data-part`**: branch-control
**`data-path`**: The path of the item
**`data-state`**: "open" | "closed"
**`data-disabled`**: Present when disabled
**`data-selected`**: Present when selected
**`data-focus`**: Present when focused
**`data-value`**: The value of the item
**`data-depth`**: The depth of the item

**`BranchText`**

**`data-scope`**: tree-view
**`data-part`**: branch-text
**`data-disabled`**: Present when disabled
**`data-state`**: "open" | "closed"

**`BranchContent`**

**`data-scope`**: tree-view
**`data-part`**: branch-content
**`data-state`**: "open" | "closed"
**`data-depth`**: The depth of the item
**`data-path`**: The path of the item
**`data-value`**: The value of the item

**`BranchIndentGuide`**

**`data-scope`**: tree-view
**`data-part`**: branch-indent-guide
**`data-depth`**: The depth of the item

## Accessibility

Adheres to the
[Tree View WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview).

### Keyboard Interactions

**`Tab`**
Description: Moves focus to the tree view, placing the first tree view item in focus.

**`Enter + Space`**
Description: Selects the item or branch node

**`ArrowDown`**
Description: Moves focus to the next node

**`ArrowUp`**
Description: Moves focus to the previous node

**`ArrowRight`**
Description: When focus is on a closed branch node, opens the branch.<br> When focus is on an open branch node, moves focus to the first item node.

**`ArrowLeft`**
Description: When focus is on an open branch node, closes the node.<br> When focus is on an item or branch node, moves focus to its parent branch node.

**`Home`**
Description: Moves focus to first node without opening or closing a node.

**`End`**
Description: Moves focus to the last node that can be focused without expanding any nodes that are closed.

**`a-z + A-Z`**
Description: Focus moves to the next node with a name that starts with the typed character. The search logic ignores nodes that are descendants of closed branch.

**`*`**
Description: Expands all sibling nodes that are at the same depth as the focused node.

**`Shift + ArrowDown`**
Description: Moves focus to and toggles the selection state of the next node.

**`Shift + ArrowUp`**
Description: Moves focus to and toggles the selection state of the previous node.

**`Ctrl + A`**
Description: Selects all nodes in the tree. If all nodes are selected, unselects all nodes.