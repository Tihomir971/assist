# Select

A Select component allows users pick a value from predefined options.

## Resources


[Latest version: v1.11.0](https://www.npmjs.com/package/@zag-js/select)
[Logic Visualizer](https://zag-visualizer.vercel.app/select)
[Source Code](https://github.com/chakra-ui/zag/tree/main/packages/machines/select)



**Features**

- Support for selecting a single or multiple option
- Keyboard support for opening the listbox using the arrow keys, including
  automatically focusing the first or last item.
- Support for looping keyboard navigation.
- Support for selecting an item on blur.
- Typeahead to allow selecting options by typing text, even without opening the
  listbox
- Support for Right to Left direction.

## Installation

To use the select machine in your project, run the following command in your
command line:

```bash
npm install @zag-js/select @zag-js/svelte
# or
yarn add @zag-js/select @zag-js/svelte
```


## Anatomy

To set up the select correctly, you'll need to understand its anatomy and how we
name its parts.

> Each part includes a `data-part` attribute to help identify them in the DOM.



## Usage

First, import the select package into your project

```jsx
import * as select from "@zag-js/select"
```

The select package exports these functions:

- `machine` — The state machine logic for the select.
- `connect` — The function that translates the machine's state to JSX attributes
  and event handlers.
- `collection` - The function that creates a
  [collection interface](/overview/collection) from an array of items.

> You'll need to provide a unique `id` to the `useMachine` hook. This is used to
> ensure that every part has a unique identifier.

Next, import the required hooks and functions for your framework and use the
select machine in your project 🔥

```svelte
<script lang="ts">
  import * as select from "@zag-js/select"
  import { portal, useMachine, normalizeProps } from "@zag-js/svelte"

  const selectData = [
    { label: "Nigeria", value: "NG" },
    { label: "Japan", value: "JP" },
    { label: "Korea", value: "KO" },
    { label: "Kenya", value: "KE" },
    { label: "United Kingdom", value: "UK" },
    { label: "Ghana", value: "GH" },
    { label: "Uganda", value: "UG" },
  ]

  const collection = select.collection({
    items: selectData,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })

  const id = $props.id()
  const service = useMachine(select.machine, {
    id,
    collection,
  })
  const api = $derived(select.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...api.getControlProps()}>
    <label {...api.getLabelProps()}>Label</label>
    <button {...api.getTriggerProps()}>
      {api.valueAsString || "Select option"}
    </button>
  </div>

  <div use:portal {...api.getPositionerProps()}>
    <ul {...api.getContentProps()}>
      {#each selectData as item}
        <li {...api.getItemProps({ item })}>
          <span {...api.getItemTextProps({ item })}>{item.label}</span>
          <span {...api.getItemIndicatorProps({ item })}>✓</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
```


## Setting the initial value

To set the initial value of the select, pass the `value` property to the select
machine's context.

> The `value` property must be an array of strings. If selecting a single value,
> pass an array with a single string.

```jsx {13}
const collection = select.collection({
  items: [
    { label: "Nigeria", value: "ng" },
    { label: "Ghana", value: "gh" },
    { label: "Kenya", value: "ke" },
    //...
  ],
})

const service = useMachine(select.machine, {
  id: useId(),
  collection,
  defaultValue: ["ng"],
})
```

## Selecting multiple values

To allow selecting multiple values, set the `multiple` property in the machine's
context to `true`.

```jsx {5}
const service = useMachine(select.machine, {
  id: useId(),
  collection,
  multiple: true,
})
```

## Using a custom object format

By default, the select collection expects an array of items with `label` and
`value` properties. To use a custom object format, pass the `itemToString` and
`itemToValue` properties to the collection function.

- `itemToString` — A function that returns the string representation of an item.
  Used to compare items when filtering.
- `itemToValue` — A function that returns the unique value of an item.
- `itemToDisabled` — A function that returns the disabled state of an item.

```jsx
const collection = select.collection({
  // custom object format
  items: [
    { id: 1, fruit: "Banana", available: true, quantity: 10 },
    { id: 2, fruit: "Apple", available: false, quantity: 5 },
    { id: 3, fruit: "Orange", available: true, quantity: 3 },
    //...
  ],
  // convert item to string
  itemToString(item) {
    return item.fruit
  },
  // convert item to value
  itemToValue(item) {
    return item.id
  },
  // convert item to disabled state
  itemToDisabled(item) {
    return !item.available || item.quantity === 0
  },
})

// use the collection
const service = useMachine(select.machine, {
  id: useId(),
  collection,
})
```

## Usage within a form

To use select within a form, you'll need to:

- Pass the `name` property to the select machine's context
- Render a hidden `select` element using `api.getSelectProps()`

```svelte
<script lang="ts">
  import * as select from "@zag-js/select"
  import { portal, normalizeProps, useMachine } from "@zag-js/svelte"

  const selectData = [
    { label: "Nigeria", value: "NG" },
    { label: "Japan", value: "JP" },
    { label: "Korea", value: "KO" },
    { label: "Kenya", value: "KE" },
    { label: "United Kingdom", value: "UK" },
    { label: "Ghana", value: "GH" },
    { label: "Uganda", value: "UG" },
  ]

  const service = useMachine(select.machine, {
    id: "1",
    collection: select.collection({ items: selectData }),
    name: "country",
  })

  const api = $derived(select.connect(service, normalizeProps))
</script>

<form>
  <!-- Hidden select -->
  <select {...api.getHiddenSelectProps()}>
    {#each selectData as option}
      <option value={option.value}>
        {option.label}
      </option>
    {/each}
  </select>

  <!-- Custom Select -->

<div {...api.getControlProps()}>
  <label {...api.getLabelProps()}>Label</label>
  <button type="button" {...api.getTriggerProps()}>
    <span>{api.valueAsString || "Select option"}</span>
    <CaretIcon />
  </button>
</div>

  <div use:portal {...api.getPositionerProps()}>
    <ul {...api.getContentProps()}>
      {#each selectData as item}
        <li {...api.getItemProps({ item })}>
          <span>{item.label}</span>
          <span {...api.getItemIndicatorProps({ item })}>✓</span>
        </li>
      {/each}
    </ul>
  </div>
</form>
```


## Disabling the select

To disable the select, set the `disabled` property in the machine's context to
`true`.

```jsx {4}
const service = useMachine(select.machine, {
  id: useId(),
  collection,
  disabled: true,
})
```

## Disabling an item

To make a combobox option disabled, pass the `isItemDisabled` property to the
collection function.

```jsx {3-4}
const collection = select.collection({
  items: countries,
  isItemDisabled(item) {
    return item.disabled
  },
})

const service = useMachine(select.machine, {
  id: useId(),
  collection,
})
```

## Close on select

This behaviour ensures that the menu is closed when an item is selected and is
`true` by default. It's only concerned with when an item is selected with
pointer, space key or enter key. To disable the behaviour, set the
`closeOnSelect` property in the machine's context to `false`.

```jsx {4}
const service = useMachine(select.machine, {
  id: useId(),
  collection,
  closeOnSelect: false,
})
```

## Looping the keyboard navigation

When navigating with the select using the arrow down and up keys, the select
stops at the first and last options. If you need want the navigation to loop
back to the first or last option, set the `loop: true` in the machine's context.

```jsx {4}
const service = useMachine(select.machine, {
  id: useId(),
  collection,
  loop: true,
})
```

## Listening for highlight changes

When an item is highlighted with the pointer or keyboard, use the
`onHighlightChange` to listen for the change and do something with it.

```jsx {3-6}
const service = useMachine(select.machine, {
  id: useId(),
  onHighlightChange(details) {
    // details => { highlightedValue: string | null, highlightedItem: CollectionItem | null }
    console.log(details)
  },
})
```

## Listening for selection changes

When an item is selected, use the `onValueChange` property to listen for the
change and do something with it.

```jsx {4-6}
const service = useMachine(select.machine, {
  id: useId(),
  collection,
  onValueChange(details) {
    // details => { value: string[], items: Item[] }
    console.log(details)
  },
})
```

## Listening for open and close events

When the select is opened or closed, the `onOpenChange` callback is called. You
can listen for these events and do something with it.

```jsx {4-7}
const service = useMachine(select.machine, {
  id: useId(),
  collection,
  onOpenChange(details) {
    // details => { open: boolean }
    console.log("Select opened")
  },
})
```

## Usage with large data

Combine the select machine with the virtualization library like `react-window`
or `@tanstack/react-virtual` to handle large data.

Here's an example using `@tanstack/react-virtual`:

```jsx
function Demo() {
  const selectData = []

  const contentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: selectData.length,
    getScrollElement: () => contentRef.current,
    estimateSize: () => 32,
  })

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      rowVirtualizer.scrollToIndex(details.index, {
        align: "center",
        behavior: "auto",
      })
    },
  })

  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      {/* ... */}
      <Portal>
        <div {...api.getPositionerProps()}>
          <div ref={contentRef} {...api.getContentProps()}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const item = selectData[virtualItem.index]
                return (
                  <div
                    key={item.value}
                    {...api.getItemProps({ item })}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <span>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}
```

## Usage within dialog

When using the select within a dialog, avoid rendering the select in a `Portal`
or `Teleport`. This is because the dialog will trap focus within it, and the
select will be rendered outside the dialog.

## Styling guide

Earlier, we mentioned that each select part has a `data-part` attribute added to
them to select and style them in the DOM.

### Open and closed state

When the select is open, the trigger and content is given a `data-state`
attribute.

```css
[data-part="trigger"][data-state="open|closed"] {
  /* styles for open or closed state */
}

[data-part="content"][data-state="open|closed"] {
  /* styles for open or closed state */
}
```

### Selected state

Items are given a `data-state` attribute, indicating whether they are selected.

```css
[data-part="item"][data-state="checked|unchecked"] {
  /* styles for selected or unselected state */
}
```

### Highlighted state

When an item is highlighted, via keyboard navigation or pointer, it is given a
`data-highlighted` attribute.

```css
[data-part="item"][data-highlighted] {
  /* styles for highlighted state */
}
```

### Invalid state

When the select is invalid, the label and trigger is given a `data-invalid`
attribute.

```css
[data-part="label"][data-invalid] {
  /* styles for invalid state */
}

[data-part="trigger"][data-invalid] {
  /* styles for invalid state */
}
```

### Disabled state

When the select is disabled, the trigger and label is given a `data-disabled`
attribute.

```css
[data-part="trigger"][data-disabled] {
  /* styles for disabled select state */
}

[data-part="label"][data-disabled] {
  /* styles for disabled label state */
}

[data-part="item"][data-disabled] {
  /* styles for disabled option state */
}
```

> Optionally, when an item is disabled, it is given a `data-disabled` attribute.

### Empty state

When no option is selected, the trigger is given a `data-placeholder-shown`
attribute.

```css
[data-part="trigger"][data-placeholder-shown] {
  /* styles for empty select state */
}
```

## Methods and Properties

### Machine Context

The select machine exposes the following context properties:

**`collection`**
Type: `ListCollection<T>`
Description: The item collection

**`ids`**
Type: `Partial<{ root: string; content: string; control: string; trigger: string; clearTrigger: string; label: string; hiddenSelect: string; positioner: string; item(id: string | number): string; itemGroup(id: string | number): string; itemGroupLabel(id: string | number): string; }>`
Description: The ids of the elements in the select. Useful for composition.

**`name`**
Type: `string`
Description: The `name` attribute of the underlying select.

**`form`**
Type: `string`
Description: The associate form of the underlying select.

**`disabled`**
Type: `boolean`
Description: Whether the select is disabled

**`invalid`**
Type: `boolean`
Description: Whether the select is invalid

**`readOnly`**
Type: `boolean`
Description: Whether the select is read-only

**`required`**
Type: `boolean`
Description: Whether the select is required

**`closeOnSelect`**
Type: `boolean`
Description: Whether the select should close after an item is selected

**`onHighlightChange`**
Type: `(details: HighlightChangeDetails<T>) => void`
Description: The callback fired when the highlighted item changes.

**`onValueChange`**
Type: `(details: ValueChangeDetails<T>) => void`
Description: The callback fired when the selected item changes.

**`onOpenChange`**
Type: `(details: OpenChangeDetails) => void`
Description: Function called when the popup is opened

**`positioning`**
Type: `PositioningOptions`
Description: The positioning options of the menu.

**`value`**
Type: `string[]`
Description: The controlled keys of the selected items

**`defaultValue`**
Type: `string[]`
Description: The initial default value of the select when rendered.
Use when you don't need to control the value of the select.

**`highlightedValue`**
Type: `string`
Description: The controlled key of the highlighted item

**`defaultHighlightedValue`**
Type: `string`
Description: The initial value of the highlighted item when opened.
Use when you don't need to control the highlighted value of the select.

**`loopFocus`**
Type: `boolean`
Description: Whether to loop the keyboard navigation through the options

**`multiple`**
Type: `boolean`
Description: Whether to allow multiple selection

**`open`**
Type: `boolean`
Description: Whether the select menu is open

**`defaultOpen`**
Type: `boolean`
Description: Whether the select's open state is controlled by the user

**`scrollToIndexFn`**
Type: `(details: ScrollToIndexDetails) => void`
Description: Function to scroll to a specific index

**`composite`**
Type: `boolean`
Description: Whether the select is a composed with other composite widgets like tabs or combobox

**`deselectable`**
Type: `boolean`
Description: Whether the value can be cleared by clicking the selected item.

**Note:** this is only applicable for single selection

**`dir`**
Type: `"ltr" | "rtl"`
Description: The document's text/writing direction.

**`id`**
Type: `string`
Description: The unique identifier of the machine.

**`getRootNode`**
Type: `() => ShadowRoot | Node | Document`
Description: A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron.

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

The select `api` exposes the following methods:

**`focused`**
Type: `boolean`
Description: Whether the select is focused

**`open`**
Type: `boolean`
Description: Whether the select is open

**`empty`**
Type: `boolean`
Description: Whether the select value is empty

**`highlightedValue`**
Type: `string`
Description: The value of the highlighted item

**`highlightedItem`**
Type: `V`
Description: The highlighted item

**`highlightValue`**
Type: `(value: string) => void`
Description: Function to highlight a value

**`selectedItems`**
Type: `V[]`
Description: The selected items

**`hasSelectedItems`**
Type: `boolean`
Description: Whether there's a selected option

**`value`**
Type: `string[]`
Description: The selected item keys

**`valueAsString`**
Type: `string`
Description: The string representation of the selected items

**`selectValue`**
Type: `(value: string) => void`
Description: Function to select a value

**`selectAll`**
Type: `() => void`
Description: Function to select all values

**`setValue`**
Type: `(value: string[]) => void`
Description: Function to set the value of the select

**`clearValue`**
Type: `(value?: string) => void`
Description: Function to clear the value of the select.
If a value is provided, it will only clear that value, otherwise, it will clear all values.

**`focus`**
Type: `() => void`
Description: Function to focus on the select input

**`getItemState`**
Type: `(props: ItemProps<any>) => ItemState`
Description: Returns the state of a select item

**`setOpen`**
Type: `(open: boolean) => void`
Description: Function to open or close the select

**`collection`**
Type: `ListCollection<V>`
Description: Function to toggle the select

**`reposition`**
Type: `(options?: Partial<PositioningOptions>) => void`
Description: Function to set the positioning options of the select

**`multiple`**
Type: `boolean`
Description: Whether the select allows multiple selections

**`disabled`**
Type: `boolean`
Description: Whether the select is disabled

### Data Attributes

**`Root`**

**`data-scope`**: select
**`data-part`**: root
**`data-invalid`**: Present when invalid
**`data-readonly`**: Present when read-only

**`Label`**

**`data-scope`**: select
**`data-part`**: label
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid
**`data-readonly`**: Present when read-only

**`Control`**

**`data-scope`**: select
**`data-part`**: control
**`data-state`**: "open" | "closed"
**`data-focus`**: Present when focused
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid

**`ValueText`**

**`data-scope`**: select
**`data-part`**: value-text
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid
**`data-focus`**: Present when focused

**`Trigger`**

**`data-scope`**: select
**`data-part`**: trigger
**`data-state`**: "open" | "closed"
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid
**`data-readonly`**: Present when read-only
**`data-placement`**: The placement of the trigger
**`data-placeholder-shown`**: Present when placeholder is shown

**`Indicator`**

**`data-scope`**: select
**`data-part`**: indicator
**`data-state`**: "open" | "closed"
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid
**`data-readonly`**: Present when read-only

**`Item`**

**`data-scope`**: select
**`data-part`**: item
**`data-value`**: The value of the item
**`data-state`**: "checked" | "unchecked"
**`data-highlighted`**: Present when highlighted
**`data-disabled`**: Present when disabled

**`ItemText`**

**`data-scope`**: select
**`data-part`**: item-text
**`data-state`**: "checked" | "unchecked"
**`data-disabled`**: Present when disabled
**`data-highlighted`**: Present when highlighted

**`ItemIndicator`**

**`data-scope`**: select
**`data-part`**: item-indicator
**`data-state`**: "checked" | "unchecked"

**`ItemGroup`**

**`data-scope`**: select
**`data-part`**: item-group
**`data-disabled`**: Present when disabled

**`ClearTrigger`**

**`data-scope`**: select
**`data-part`**: clear-trigger
**`data-invalid`**: Present when invalid

**`Content`**

**`data-scope`**: select
**`data-part`**: content
**`data-state`**: "open" | "closed"
**`data-placement`**: The placement of the content
**`data-activedescendant`**: 

## Accessibility

Adheres to the
[ListBox WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox).

### Keyboard Interactions

**`Space`**
Description: <span>When focus is on trigger, opens the select and focuses the first selected item.<br />When focus is on the content, selects the highlighted item.</span>

**`Enter`**
Description: <span>When focus is on trigger, opens the select and focuses the first selected item.<br />When focus is on content, selects the focused item.</span>

**`ArrowDown`**
Description: <span>When focus is on trigger, opens the select.<br />When focus is on content, moves focus to the next item.</span>

**`ArrowUp`**
Description: <span>When focus is on trigger, opens the select.<br />When focus is on content, moves focus to the previous item.</span>

**`Esc`**
Description: <span>Closes the select and moves focus to trigger.</span>

**`A-Z + a-z`**
Description: <span>When focus is on trigger, selects the item whose label starts with the typed character.<br />When focus is on the listbox, moves focus to the next item with a label that starts with the typed character.</span>
