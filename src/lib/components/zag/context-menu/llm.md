# Context Menu

An accessible dropdown and context menu that is used to display a list of
actions or options that a user can choose when a trigger element is
right-clicked or long pressed.

## Resources


[Latest version: v1.12.0](https://www.npmjs.com/package/@zag-js/menu)
[Logic Visualizer](https://zag-visualizer.vercel.app/menu)
[Source Code](https://github.com/chakra-ui/zag/tree/main/packages/machines/menu)



**Features**

- Support for items, labels, groups of items
- Focus is fully managed using `aria-activedescendant` pattern
- Typeahead to allow focusing items by typing text
- Keyboard navigation support including arrow keys, home/end, page up/down

## Installation

To use the menu machine in your project, run the following command in your
command line:

```bash
npm install @zag-js/menu @zag-js/svelte
# or
yarn add @zag-js/menu @zag-js/svelte
```


## Anatomy

To set up the menu correctly, you'll need to understand its anatomy and how we
name its parts.

> Each part includes a `data-part` attribute to help identify them in the DOM.



## Usage

First, import the menu package into your project

```jsx
import * as menu from "@zag-js/menu"
```

The menu package exports two key functions:

- `machine` - The state machine logic for the menu widget.
- `connect` - The function that translates the machine's state to JSX attributes
  and event handlers.

> You'll need to provide a unique `id` to the `useMachine` hook. This is used to
> ensure that every part has a unique identifier.

Next, import the required hooks and functions for your framework and use the
menu machine in your project ðŸ”¥

To show the menu when a trigger element is right-clicked, use the
`contextTriggerProps` provided by the menu's connect function.

Context menu's are also opened during a long-press of roughly `700ms` when the
pointer is pen or touch.

```svelte
<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(menu.machine, { id })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<div>
  <div {...api.getContextTriggerProps()}>
    <div>Open context menu</div>
  </div>
  <div {...api.getPositionerProps()}>
    <ul {...api.getContentProps()}>
      <li {...api.getItemProps({ value: "edit" })}>Edit</li>
      <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
      <li {...api.getItemProps({ value: "delete" })}>Delete</li>
      <li {...api.getItemProps({ value: "export" })}>Export...</li>
    </ul>
  </div>
</div>
```


## Styling guide

Earlier, we mentioned that each menu part has a `data-part` attribute added to
them to select and style them in the DOM.

### Focused item state

When an item is focused, via keyboard navigation or pointer, it is given a
`data-focus` attribute.

```css
[data-part="item"][data-focus] {
  /* styles for focused state */
}

[data-part="item"][data-type="radio|checkbox"][data-focus] {
  /* styles for focused state */
}
```

### Disabled item state

When an item or an option item is disabled, it is given a `data-disabled`
attribute.

```css
[data-part="item"][data-disabled] {
  /* styles for disabled state */
}

[data-part="item"][data-type="radio|checkbox"][data-disabled] {
  /* styles for disabled state */
}
```

### Using arrows

When using arrows within the menu, you can style it using css variables.

```css
[data-part="arrow"] {
  --arrow-size: 20px;
  --arrow-background: red;
}
```

### Checked option item state

When an option item is checked, it is given a `data-checked` attribute.

```css
[data-part="item"][data-type="radio|checkbox"][data-checked] {
  /* styles for checked state */
}
```

## Methods and Properties

### Machine Context

The menu machine exposes the following context properties:

**`ids`**
Type: `Partial<{ trigger: string; contextTrigger: string; content: string; groupLabel(id: string): string; group(id: string): string; positioner: string; arrow: string; }>`
Description: The ids of the elements in the menu. Useful for composition.

**`defaultHighlightedValue`**
Type: `string`
Description: The initial highlighted value of the menu item when rendered.
Use when you don't need to control the highlighted value of the menu item.

**`highlightedValue`**
Type: `string`
Description: The controlled highlighted value of the menu item.

**`onHighlightChange`**
Type: `(details: HighlightChangeDetails) => void`
Description: Function called when the highlighted menu item changes.

**`onSelect`**
Type: `(details: SelectionDetails) => void`
Description: Function called when a menu item is selected.

**`anchorPoint`**
Type: `Point`
Description: The positioning point for the menu. Can be set by the context menu trigger or the button trigger.

**`loopFocus`**
Type: `boolean`
Description: Whether to loop the keyboard navigation.

**`positioning`**
Type: `PositioningOptions`
Description: The options used to dynamically position the menu

**`closeOnSelect`**
Type: `boolean`
Description: Whether to close the menu when an option is selected

**`aria-label`**
Type: `string`
Description: The accessibility label for the menu

**`open`**
Type: `boolean`
Description: The controlled open state of the menu

**`onOpenChange`**
Type: `(details: OpenChangeDetails) => void`
Description: Function called when the menu opens or closes

**`defaultOpen`**
Type: `boolean`
Description: The initial open state of the menu when rendered.
Use when you don't need to control the open state of the menu.

**`typeahead`**
Type: `boolean`
Description: Whether the pressing printable characters should trigger typeahead navigation

**`composite`**
Type: `boolean`
Description: Whether the menu is a composed with other composite widgets like a combobox or tabs

**`navigate`**
Type: `(details: NavigateDetails) => void`
Description: Function to navigate to the selected item if it's an anchor element

**`dir`**
Type: `"ltr" | "rtl"`
Description: The document's text/writing direction.

**`id`**
Type: `string`
Description: The unique identifier of the machine.

**`getRootNode`**
Type: `() => ShadowRoot | Node | Document`
Description: A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron.

**`onEscapeKeyDown`**
Type: `(event: KeyboardEvent) => void`
Description: Function called when the escape key is pressed

**`onPointerDownOutside`**
Type: `(event: PointerDownOutsideEvent) => void`
Description: Function called when the pointer is pressed down outside the component

**`onFocusOutside`**
Type: `(event: FocusOutsideEvent) => void`
Description: Function called when the focus is moved outside the component

**`onInteractOutside`**
Type: `(event: InteractOutsideEvent) => void`
Description: Function called when an interaction happens outside the component

### Machine API

The menu `api` exposes the following methods:

**`open`**
Type: `boolean`
Description: Whether the menu is open

**`setOpen`**
Type: `(open: boolean) => void`
Description: Function to open or close the menu

**`highlightedValue`**
Type: `string`
Description: The id of the currently highlighted menuitem

**`setHighlightedValue`**
Type: `(value: string) => void`
Description: Function to set the highlighted menuitem

**`setParent`**
Type: `(parent: MenuService) => void`
Description: Function to register a parent menu. This is used for submenus

**`setChild`**
Type: `(child: MenuService) => void`
Description: Function to register a child menu. This is used for submenus

**`reposition`**
Type: `(options?: Partial<PositioningOptions>) => void`
Description: Function to reposition the popover

**`getOptionItemState`**
Type: `(props: OptionItemProps) => OptionItemState`
Description: Returns the state of the option item

**`getItemState`**
Type: `(props: ItemProps) => ItemState`
Description: Returns the state of the menu item

**`addItemListener`**
Type: `(props: ItemListenerProps) => VoidFunction`
Description: Setup the custom event listener for item selection event

### Data Attributes

**`Trigger`**

**`data-scope`**: menu
**`data-part`**: trigger
**`data-placement`**: The placement of the trigger
**`data-state`**: "open" | "closed"

**`Indicator`**

**`data-scope`**: menu
**`data-part`**: indicator
**`data-state`**: "open" | "closed"

**`Content`**

**`data-scope`**: menu
**`data-part`**: content
**`data-state`**: "open" | "closed"
**`data-placement`**: The placement of the content

**`Item`**

**`data-scope`**: menu
**`data-part`**: item
**`data-disabled`**: Present when disabled
**`data-highlighted`**: Present when highlighted
**`data-value`**: The value of the item
**`data-valuetext`**: The human-readable value

**`OptionItem`**

**`data-scope`**: menu
**`data-part`**: option-item
**`data-type`**: The type of the item
**`data-value`**: The value of the item
**`data-state`**: "checked" | "unchecked"
**`data-disabled`**: Present when disabled
**`data-highlighted`**: Present when highlighted
**`data-valuetext`**: The human-readable value

**`ItemIndicator`**

**`data-scope`**: menu
**`data-part`**: item-indicator
**`data-disabled`**: Present when disabled
**`data-highlighted`**: Present when highlighted
**`data-state`**: "checked" | "unchecked"

**`ItemText`**

**`data-scope`**: menu
**`data-part`**: item-text
**`data-disabled`**: Present when disabled
**`data-highlighted`**: Present when highlighted
**`data-state`**: "checked" | "unchecked"

## Accessibility

Uses
[aria-activedescendant](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-actions-active-descendant/)
pattern to manage focus movement among menu items.

### Keyboard Interactions

**`Space`**
Description: Activates/Selects the highlighted item

**`Enter`**
Description: Activates/Selects the highlighted item

**`ArrowDown`**
Description: Highlights the next item in the menu

**`ArrowUp`**
Description: Highlights the previous item in the menu

**`ArrowRight + ArrowLeft`**
Description: When focus is on trigger, opens or closes the submenu depending on reading direction.

**`Esc`**
Description: Closes the context menu