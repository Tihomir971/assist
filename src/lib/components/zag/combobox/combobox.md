# Combobox

A combobox is an input widget with an associated popup that enables users to
select a value from a collection of possible values.

## Resources


[Latest version: v1.10.0](https://www.npmjs.com/package/@zag-js/combobox)
[Logic Visualizer](https://zag-visualizer.vercel.app/combobox)
[Source Code](https://github.com/chakra-ui/zag/tree/main/packages/machines/combobox)



**Features**

- Support for selecting multiple values
- Support for disabled options
- Support for custom user input values
- Support for mouse, touch, and keyboard interactions
- Keyboard support for opening the combo box list box using the arrow keys,
  including automatically focusing the first or last item accordingly

## Installation

To use the combobox machine in your project, run the following command in your
command line:

```bash
npm install @zag-js/combobox @zag-js/svelte
# or
yarn add @zag-js/combobox @zag-js/svelte
```


## Anatomy

To set up the combobox correctly, you'll need to understand its anatomy and how
we name its parts.

> Each part includes a `data-part` attribute to help identify them in the DOM.



## Usage

First, import the combobox package into your project

```jsx
import * as combobox from "@zag-js/combobox"
```

The combobox package exports these functions:

- `machine` â€” The state machine logic for the combobox widget.
- `connect` â€” The function that translates the machine's state to JSX attributes
  and event handlers.
- `collection` - The function that creates a
  [collection interface](/overview/collection) from an array of items.

Next, import the required hooks and functions for your framework and use the
combobox machine in your project ðŸ”¥

```svelte
<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { useMachine, normalizeProps } from "@zag-js/svelte"

  const comboboxData = [
    { label: "Zambia", code: "ZA" },
    { label: "Benin", code: "BN" },
    //...
  ]

  let options = $state.raw(comboboxData)

  const collection = combobox.collection({
    items: comboboxData,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const id = $props.id()
  const service = useMachine(combobox.machine, {
    id,
    collection,
    onOpenChange() {
      options = comboboxData
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) =>
        item.label.toLowerCase().includes(inputValue.toLowerCase()),
      )
      const newOptions = filtered.length > 0 ? filtered : comboboxData

      collection.setItems(newOptions)
      options = newOptions
    },
  })
  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <label {...api.getLabelProps()}>Select country</label>
  <div {...api.getControlProps()}>
    <input {...api.getInputProps()} />
    <button {...api.getTriggerProps()}>â–¼</button>
  </div>
</div>
<div {...api.getPositionerProps()}>
  {#if options.length > 0}
  <ul {...api.getContentProps()}>
    {#each options as item}
    <li {...api.getItemProps({ item })}>{item.label}</li>
    {/each}
  </ul>
  {/if}
</div>
```


## Setting the initial value

To set the initial value of the combobox, pass the `value` property to the
machine's context.

> The `value` property must be an array of strings. If selecting a single value,
> pass an array with a single string.

```jsx {13}
const collection = combobox.collection({
  items: [
    { label: "Nigeria", value: "ng" },
    { label: "Ghana", value: "gh" },
    { label: "Kenya", value: "ke" },
    //...
  ],
})

const service = useMachine(combobox.machine, {
  id: useId(),
  collection,
  defaultValue: ["ng"],
})
```

## Selecting multiple values

To allow selecting multiple values, set the `multiple` property in the machine's
context to `true`.

```jsx {4}
const service = useMachine(combobox.machine, {
  id: useId(),
  collection,
  multiple: true,
})
```

## Using a custom object format

By default, the combobox collection expects an array of items with `label` and
`value` properties. To use a custom object format, pass the `itemToString` and
`itemToValue` properties to the collection function.

- `itemToString` â€” A function that returns the string representation of an item.
  Used to compare items when filtering.
- `itemToValue` â€” A function that returns the unique value of an item.
- `itemToDisabled` â€” A function that returns the disabled state of an item.

```jsx
const collection = combobox.collection({
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
const service = useMachine(combobox.machine, {
  id: useId(),
  collection,
})
```

## Rendering the selected values outside the combobox

By default, the selected values of a combobox are displayed in the input
element, when selecting multiple items, it is a better UX to render the selected
value outside the combobox.

To achieve this you need to:

- Set the `selectionBehavior` to `clear`, which clears the input value when an
  item is selected.
- Set the `multiple` property to `true` to allow selecting multiple values.
- Render the selected values outside the combobox.

```jsx {4-6}
const service = useMachine(combobox.machine, {
  id: useId(),
  collection,
  selectionBehavior: "clear",
  multiple: true,
})
```

## Disabling the combobox

To make a combobox disabled, set the context's `disabled` property to `true`

```jsx {2}
const service = useMachine(combobox.machine, {
  disabled: true,
})
```

## Disabling an option

To make a combobox option disabled, pass the `isItemDisabled` property to the
collection function.

```jsx {6-8}
const service = useMachine(combobox.machine, {
  id: useId(),
  collection: combobox.collection({
    items: countries,
    isItemDisabled(item) {
      return item.disabled
    },
  }),
})
```

## Close on select

This behaviour ensures that the menu is closed when an option is selected and is
`true` by default. It's only concerned with when an option is selected with
pointer or enter key. To disable the behaviour, set the `closeOnSelect` property
in the machine's context to `false`.

```jsx {2}
const service = useMachine(combobox.machine, {
  closeOnSelect: false,
})
```

## Making the combobox readonly

To make a combobox readonly, set the context's `readOnly` property to `true`

```jsx {2}
const service = useMachine(combobox.machine, {
  readOnly: true,
})
```

## Listening for highlight changes

When an option is highlighted with the pointer or keyboard, use the
`onHighlightChange` property to listen for this change and do something with it.

```jsx {3-6}
const service = useMachine(combobox.machine, {
  id: useId(),
  onHighlightChange(details) {
    // details => { value: string | null; item: CollectionItem | null }
    console.log(details)
  },
})
```

## Listening for value changes

When an item is selected, use `onValueChange` property to listen for this change
and do something with it.

```jsx {3-6}
const service = useMachine(combobox.machine, {
  onValueChange(details) {
    // details => { value: string[]; items: CollectionItem[] }
    console.log(details)
  },
})
```

## Usage within forms

The combobox works when placed within a form and the form is submitted. We
achieve this by:

- ensuring we emit the input event as the value changes.
- adding a `name` attribute to the input so the value can be accessed in the
  `FormData`.

To get this feature working you need to pass a `name` option to the context.

```jsx {2}
const service = useMachine(combobox.machine, {
  name: "countries",
})
```

## Allowing custom values

By default, the combobox only allows selecting values from the collection. To
allow custom values, set the `allowCustomValue` property in the machine's
context to `true`.

```jsx {2}
const service = useMachine(combobox.machine, {
  allowCustomValue: true,
})
```

## Styling guide

Earlier, we mentioned that each combobox part has a `data-part` attribute added
to them to select and style them in the DOM.

### Open and closed state

When the combobox is open or closed, the `data-state` attribute is added to the
content,control, input and control parts.

```css
[data-part="control"][data-state="open|closed"] {
  /* styles for control open or state */
}

[data-part="input"][data-state="open|closed"] {
  /* styles for control open or state */
}

[data-part="trigger"][data-state="open|closed"] {
  /* styles for control open or state */
}

[data-part="content"][data-state="open|closed"] {
  /* styles for control open or state */
}
```

### Focused State

When the combobox is focused, the `data-focus` attribute is added to the control
and label parts.

```css
[data-part="control"][data-focus] {
  /* styles for control focus state */
}

[data-part="label"][data-focus] {
  /* styles for label focus state */
}
```

### Disabled State

When the combobox is disabled, the `data-disabled` attribute is added to the
label, control, trigger and option parts.

```css
[data-part="label"][data-disabled] {
  /* styles for label disabled state */
}

[data-part="control"][data-disabled] {
  /* styles for control disabled state */
}

[data-part="trigger"][data-disabled] {
  /* styles for trigger disabled state */
}

[data-part="item"][data-disabled] {
  /* styles for item disabled state */
}
```

### Invalid State

When the combobox is invalid, the `data-invalid` attribute is added to the root,
label, control and input parts.

```css
[data-part="root"][data-invalid] {
  /* styles for root invalid state */
}

[data-part="label"][data-invalid] {
  /* styles for label invalid state */
}

[data-part="control"][data-invalid] {
  /* styles for control invalid state */
}

[data-part="input"][data-invalid] {
  /* styles for input invalid state */
}
```

### Selected State

When a combobox item is selected, the `data-selected` attribute is added to the
item part.

```css
[data-part="item"][data-state="checked|unchecked"] {
  /* styles for item selected state */
}
```

### Highlighted State

When a combobox item is highlighted, the `data-highlighted` attribute is added
to the item part.

```css
[data-part="item"][data-highlighted] {
  /* styles for item highlighted state */
}
```

## Methods and Properties

### Machine Context

The combobox machine exposes the following context properties:

**`open`**
Type: `boolean`
Description: The controlled open state of the combobox

**`defaultOpen`**
Type: `boolean`
Description: The initial open state of the combobox when rendered.
Use when you don't need to control the open state of the combobox.

**`ids`**
Type: `Partial<{ root: string; label: string; control: string; input: string; content: string; trigger: string; clearTrigger: string; item(id: string, index?: number): string; positioner: string; itemGroup(id: string | number): string; itemGroupLabel(id: string | number): string; }>`
Description: The ids of the elements in the combobox. Useful for composition.

**`inputValue`**
Type: `string`
Description: The controlled value of the combobox's input

**`defaultInputValue`**
Type: `string`
Description: The initial value of the combobox's input when rendered.
Use when you don't need to control the value of the combobox's input.

**`name`**
Type: `string`
Description: The `name` attribute of the combobox's input. Useful for form submission

**`form`**
Type: `string`
Description: The associate form of the combobox.

**`disabled`**
Type: `boolean`
Description: Whether the combobox is disabled

**`readOnly`**
Type: `boolean`
Description: Whether the combobox is readonly. This puts the combobox in a "non-editable" mode
but the user can still interact with it

**`invalid`**
Type: `boolean`
Description: Whether the combobox is invalid

**`required`**
Type: `boolean`
Description: Whether the combobox is required

**`placeholder`**
Type: `string`
Description: The placeholder text of the combobox's input

**`defaultHighlightedValue`**
Type: `string`
Description: The initial highlighted value of the combobox when rendered.
Use when you don't need to control the highlighted value of the combobox.

**`highlightedValue`**
Type: `string`
Description: The controlled highlighted value of the combobox

**`value`**
Type: `string[]`
Description: The controlled value of the combobox's selected items

**`defaultValue`**
Type: `string[]`
Description: The initial value of the combobox's selected items when rendered.
Use when you don't need to control the value of the combobox's selected items.

**`inputBehavior`**
Type: `"autohighlight" | "autocomplete" | "none"`
Description: Defines the auto-completion behavior of the combobox.

- `autohighlight`: The first focused item is highlighted as the user types
- `autocomplete`: Navigating the listbox with the arrow keys selects the item and the input is updated

**`selectionBehavior`**
Type: `"clear" | "replace" | "preserve"`
Description: The behavior of the combobox input when an item is selected

- `replace`: The selected item string is set as the input value
- `clear`: The input value is cleared
- `preserve`: The input value is preserved

**`autoFocus`**
Type: `boolean`
Description: Whether to autofocus the input on mount

**`openOnClick`**
Type: `boolean`
Description: Whether to open the combobox popup on initial click on the input

**`openOnChange`**
Type: `boolean | ((details: InputValueChangeDetails) => boolean)`
Description: Whether to show the combobox when the input value changes

**`allowCustomValue`**
Type: `boolean`
Description: Whether to allow typing custom values in the input

**`loopFocus`**
Type: `boolean`
Description: Whether to loop the keyboard navigation through the items

**`positioning`**
Type: `PositioningOptions`
Description: The positioning options to dynamically position the menu

**`onInputValueChange`**
Type: `(details: InputValueChangeDetails) => void`
Description: Function called when the input's value changes

**`onValueChange`**
Type: `(details: ValueChangeDetails<T>) => void`
Description: Function called when a new item is selected

**`onHighlightChange`**
Type: `(details: HighlightChangeDetails<T>) => void`
Description: Function called when an item is highlighted using the pointer
or keyboard navigation.

**`onSelect`**
Type: `(details: SelectionDetails) => void`
Description: Function called when an item is selected

**`onOpenChange`**
Type: `(details: OpenChangeDetails) => void`
Description: Function called when the popup is opened

**`translations`**
Type: `IntlTranslations`
Description: Specifies the localized strings that identifies the accessibility elements and their states

**`collection`**
Type: `ListCollection<T>`
Description: The collection of items

**`multiple`**
Type: `boolean`
Description: Whether to allow multiple selection.

**Good to know:** When `multiple` is `true`, the `selectionBehavior` is automatically set to `clear`.
It is recommended to render the selected items in a separate container.

**`closeOnSelect`**
Type: `boolean`
Description: Whether to close the combobox when an item is selected.

**`openOnKeyPress`**
Type: `boolean`
Description: Whether to open the combobox on arrow key press

**`scrollToIndexFn`**
Type: `(details: ScrollToIndexDetails) => void`
Description: Function to scroll to a specific index

**`composite`**
Type: `boolean`
Description: Whether the combobox is a composed with other composite widgets like tabs

**`disableLayer`**
Type: `boolean`
Description: Whether to disable registering this a dismissable layer

**`navigate`**
Type: `(details: NavigateDetails) => void`
Description: Function to navigate to the selected item

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

The combobox `api` exposes the following methods:

**`focused`**
Type: `boolean`
Description: Whether the combobox is focused

**`open`**
Type: `boolean`
Description: Whether the combobox is open

**`inputValue`**
Type: `string`
Description: The value of the combobox input

**`highlightedValue`**
Type: `string`
Description: The value of the highlighted item

**`highlightedItem`**
Type: `V`
Description: The highlighted item

**`setHighlightValue`**
Type: `(value: string) => void`
Description: The value of the combobox input

**`syncSelectedItems`**
Type: `() => void`
Description: Function to sync the selected items with the value.
Useful when `value` is updated from async sources.

**`selectedItems`**
Type: `V[]`
Description: The selected items

**`hasSelectedItems`**
Type: `boolean`
Description: Whether there's a selected item

**`value`**
Type: `string[]`
Description: The selected item keys

**`valueAsString`**
Type: `string`
Description: The string representation of the selected items

**`selectValue`**
Type: `(value: string) => void`
Description: Function to select a value

**`setValue`**
Type: `(value: string[]) => void`
Description: Function to set the value of the combobox

**`clearValue`**
Type: `(value?: string) => void`
Description: Function to clear the value of the combobox

**`focus`**
Type: `() => void`
Description: Function to focus on the combobox input

**`setInputValue`**
Type: `(value: string) => void`
Description: Function to set the input value of the combobox

**`getItemState`**
Type: `(props: ItemProps) => ItemState`
Description: Returns the state of a combobox item

**`setOpen`**
Type: `(open: boolean) => void`
Description: Function to open or close the combobox

**`collection`**
Type: `ListCollection<V>`
Description: Function to toggle the combobox

**`reposition`**
Type: `(options?: Partial<PositioningOptions>) => void`
Description: Function to set the positioning options

**`multiple`**
Type: `boolean`
Description: Whether the combobox allows multiple selections

**`disabled`**
Type: `boolean`
Description: Whether the combobox is disabled

### Data Attributes

**`Root`**

**`data-scope`**: combobox
**`data-part`**: root
**`data-invalid`**: Present when invalid
**`data-readonly`**: Present when read-only

**`Label`**

**`data-scope`**: combobox
**`data-part`**: label
**`data-readonly`**: Present when read-only
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid
**`data-focus`**: Present when focused

**`Control`**

**`data-scope`**: combobox
**`data-part`**: control
**`data-state`**: "open" | "closed"
**`data-focus`**: Present when focused
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid

**`Input`**

**`data-scope`**: combobox
**`data-part`**: input
**`data-invalid`**: Present when invalid
**`data-state`**: "open" | "closed"

**`Trigger`**

**`data-scope`**: combobox
**`data-part`**: trigger
**`data-state`**: "open" | "closed"
**`data-invalid`**: Present when invalid
**`data-focusable`**: 
**`data-readonly`**: Present when read-only
**`data-disabled`**: Present when disabled

**`Content`**

**`data-scope`**: combobox
**`data-part`**: content
**`data-state`**: "open" | "closed"
**`data-placement`**: The placement of the content
**`data-empty`**: 

**`List`**

**`data-scope`**: combobox
**`data-part`**: list
**`data-empty`**: 

**`ClearTrigger`**

**`data-scope`**: combobox
**`data-part`**: clear-trigger
**`data-invalid`**: Present when invalid

**`Item`**

**`data-scope`**: combobox
**`data-part`**: item
**`data-highlighted`**: Present when highlighted
**`data-state`**: "checked" | "unchecked"
**`data-disabled`**: Present when disabled
**`data-value`**: The value of the item

**`ItemText`**

**`data-scope`**: combobox
**`data-part`**: item-text
**`data-state`**: "checked" | "unchecked"
**`data-disabled`**: Present when disabled
**`data-highlighted`**: Present when highlighted

**`ItemIndicator`**

**`data-scope`**: combobox
**`data-part`**: item-indicator
**`data-state`**: "checked" | "unchecked"

**`ItemGroup`**

**`data-scope`**: combobox
**`data-part`**: item-group
**`data-empty`**: 

## Accessibility

Adheres to the
[Combobox WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

### Keyboard Interactions

**`ArrowDown`**
Description: When the combobox is closed, opens the listbox and highlights to the first option.
When the combobox is open, moves focus to the next option.

**`ArrowUp`**
Description: When the combobox is closed, opens the listbox and highlights to the last option.
When the combobox is open, moves focus to the previous option.

**`Home`**
Description: When the combobox is open, moves focus to the first option.

**`End`**
Description: When the combobox is open, moves focus to the last option.

**`Escape`**
Description: Closes the listbox.

**`Enter`**
Description: Selects the highlighted option and closes the combobox.

**`Esc`**
Description: Closes the combobox
