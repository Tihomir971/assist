# Number Input

The number input provides controls for editing, incrementing or decrementing
numeric values using the keyboard or pointer.

## Resources


[Latest version: v1.11.0](https://www.npmjs.com/package/@zag-js/number-input)
[Logic Visualizer](https://zag-visualizer.vercel.app/number-input)
[Source Code](https://github.com/chakra-ui/zag/tree/main/packages/machines/number-input)



**Features**

- Based on the spinbutton pattern
- Supports using the scroll wheel to increment and decrement the value
- Handles floating point rounding errors when incrementing, decrementing, and
  snapping to step
- Supports pressing and holding the spin buttons to continuously increment or
  decrement
- Supports rounding value to specific number of fraction digits
- Support for scrubbing interaction

## Installation

To use the number input machine in your project, run the following command in
your command line:

```bash
npm install @zag-js/number-input @zag-js/svelte
# or
yarn add @zag-js/number-input @zag-js/svelte
```


## Anatomy

To set up the number input correctly, you'll need to understand its anatomy and
how we name its parts.

> Each part includes a `data-part` attribute to help identify them in the DOM.



## Usage

First, import the number input package into your project

```jsx
import * as numberInput from "@zag-js/number-input"
```

The number input package exports two key functions:

- `machine` â€” The state machine logic for the number input widget as described
  in the WAI-ARIA spinner pattern.
- `connect` â€” The function that translates the machine's state to JSX attributes
  and event handlers.

> You'll need to provide a unique `id` to the `useMachine` hook. This is used to
> ensure that the every part has a unique identifier.

Next, import the required hooks and functions for your framework and use the
number input machine in your project ðŸ”¥

```svelte
<script lang="ts">
  import * as numberInput from "@zag-js/number-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(numberInput.machine, { id })
  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <label {...api.getLabelProps()}>Enter number:</label>
  <div>
    <button {...api.getDecrementTriggerProps()}>DEC</button>
    <input {...api.getInputProps()} />
    <button {...api.getIncrementTriggerProps()}>INC</button>
  </div>
</div>
```


## Setting the initial value

To set the initial value of the number input, you can set the `value` context
property.

> **Note:** The value must be a string

```jsx {2}
const service = useMachine(numberInput.machine, {
  defaultValue: "13",
})
```

## Setting a minimum and maximum value

Pass the `min` prop or `max` prop to set an upper and lower limit for the input.
By default, the input will restrict the value to stay within the specified
range.

```jsx {2,3}
const service = useMachine(numberInput.machine, {
  min: 10,
  max: 200,
})
```

> To allow the value overflow the specified min or max, set the
> `allowOverflow: true` in the context.

## Scrubbing the input value

The number input machine supports the scrubber interaction pattern. The use this
pattern, spread the `scrubberProps` from the `api` on to the scrubbing element.

It uses the Pointer lock API and tracks the pointer movement. It also renders a
virtual cursor which mimics the real cursor's pointer.

```svelte {15}

<script lang="ts">
  import * as numberInput from "@zag-js/number-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(numberInput.machine, { id })
  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <label {...api.getLabelProps()}>Enter number:</label>
  <div>
    <div {...api.getScrubberProps()}></div>
    <input {...api.getInputProps()} />
  </div>
</div>
```


## Using the mousewheel to change value

The number input machine exposes a way to increment/decrement the value using
the mouse wheel event. To activate this, pass the `allowMouseWheel` property to
the machine's context.

```jsx {2}
const service = useMachine(numberInput.machine, {
  allowMouseWheel: true,
})
```

## Clamp value when user blurs the input

In most cases, users can type custom values in the input field. If the typed
value is greater than the max, the value is reset to max when the user blur out
of the input.

To disable this behavior, pass `clampValueOnBlur` and set to `false`.

```jsx {2}
const service = useMachine(numberInput.machine, {
  clampValueOnBlur: false,
})
```

## Listening for value changes

When the value changes, the `onValueChange` callback is invoked.

```jsx {2-7}
const service = useMachine(numberInput.machine, {
  onValueChange(details) {
    // details => { value: string, valueAsNumber: number }
    console.log("value is:", details.value)
  },
})
```

## Usage within forms

To use the number input within forms, set the `name` property in the machine's
context.

```jsx {2}
const service = useMachine(numberInput.machine, {
  name: "quantity",
})
```

## Adjusting the precision of the value

To format the input value to be rounded to specific decimal points, set the
`formatOptions` and provide `Intl.NumberFormatOptions` such as
`maximumFractionDigits` or `minimumFractionDigits`

```jsx {2-5}
const service = useMachine(numberInput.machine, {
  formatOptions: {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
  },
})
```

## Disabling long press spin

To disable the long press spin, set the `spinOnPress` to `false`.

```jsx {2}
const service = useMachine(numberInput.machine, {
  spinOnPress: false,
})
```

## Format and parse value

To apply custom formatting to the input's value, set the `formatOptions` and
provide `Intl.NumberFormatOptions` such as `style` and `currency`

```jsx {2-5}
const service = useMachine(numberInput.machine, {
  formatOptions: {
    style: "currency",
    currency: "USD",
  },
})
```

## Styling guide

Earlier, we mentioned that each number-input's part has a `data-part` attribute
added to them to select and style them in the DOM.

### Disabled state

When the number input is disabled, the root, label and input parts will have
`data-disabled` attribute added to them.

The increment and decrement spin buttons are disabled when the number input is
disabled and the min/max is reached.

```css
[data-part="root"][data-disabled] {
  /* disabled styles for the input */
}

[data-part="input"][data-disabled] {
  /* disabled styles for the input */
}

[data-part="label"][data-disabled] {
  /* disabled styles for the label */
}

[data-part="increment-trigger"][data-disabled] {
  /* disabled styles for the increment button */
}

[data-part="decrement-trigger"][data-disabled] {
  /* disabled styles for the decrement button */
}
```

### Invalid state

The number input is invalid, either by passing `invalid: true` or when the value
exceeds the max and `allowOverflow: true` is passed. When this happens, the
root, label and input parts will have `data-invalid` attribute added to them.

```css
[data-part="root"][data-invalid] {
  /* disabled styles for the input */
}

[data-part="input"][data-invalid] {
  /* invalid styles for the input */
}

[data-part="label"][data-invalid] {
  /* invalid styles for the label */
}
```

### Readonly state

When the number input is readonly, the input part will have `data-readonly`
added.

```css
[data-part="input"][data-readonly] {
  /* readonly styles for the input */
}
```

### Increment and decrement spin buttons

The spin buttons can be styled individually with their respective `data-part`
attribute.

```css
[data-part="increment-trigger"] {
  /* styles for the increment trigger element */
}

[data-part="decrement-trigger"] {
  /* styles for the decrement trigger element */
}
```

## Methods and Properties

### Machine Context

The number input machine exposes the following context properties:

**`ids`**
Type: `Partial<{ root: string; label: string; input: string; incrementTrigger: string; decrementTrigger: string; scrubber: string; }>`
Description: The ids of the elements in the number input. Useful for composition.

**`name`**
Type: `string`
Description: The name attribute of the number input. Useful for form submission.

**`form`**
Type: `string`
Description: The associate form of the input element.

**`disabled`**
Type: `boolean`
Description: Whether the number input is disabled.

**`readOnly`**
Type: `boolean`
Description: Whether the number input is readonly

**`invalid`**
Type: `boolean`
Description: Whether the number input value is invalid.

**`required`**
Type: `boolean`
Description: Whether the number input is required

**`pattern`**
Type: `string`
Description: The pattern used to check the <input> element's value against

**`value`**
Type: `string`
Description: The controlled value of the input

**`defaultValue`**
Type: `string`
Description: The initial value of the input when rendered.
Use when you don't need to control the value of the input.

**`min`**
Type: `number`
Description: The minimum value of the number input

**`max`**
Type: `number`
Description: The maximum value of the number input

**`step`**
Type: `number`
Description: The amount to increment or decrement the value by

**`allowMouseWheel`**
Type: `boolean`
Description: Whether to allow mouse wheel to change the value

**`allowOverflow`**
Type: `boolean`
Description: Whether to allow the value overflow the min/max range

**`clampValueOnBlur`**
Type: `boolean`
Description: Whether to clamp the value when the input loses focus (blur)

**`focusInputOnChange`**
Type: `boolean`
Description: Whether to focus input when the value changes

**`translations`**
Type: `IntlTranslations`
Description: Specifies the localized strings that identifies the accessibility elements and their states

**`formatOptions`**
Type: `Intl.NumberFormatOptions`
Description: The options to pass to the `Intl.NumberFormat` constructor

**`inputMode`**
Type: `InputMode`
Description: Hints at the type of data that might be entered by the user. It also determines
the type of keyboard shown to the user on mobile devices

**`onValueChange`**
Type: `(details: ValueChangeDetails) => void`
Description: Function invoked when the value changes

**`onValueInvalid`**
Type: `(details: ValueInvalidDetails) => void`
Description: Function invoked when the value overflows or underflows the min/max range

**`onFocusChange`**
Type: `(details: FocusChangeDetails) => void`
Description: Function invoked when the number input is focused

**`spinOnPress`**
Type: `boolean`
Description: Whether to spin the value when the increment/decrement button is pressed

**`locale`**
Type: `string`
Description: The current locale. Based on the BCP 47 definition.

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

The number input `api` exposes the following methods:

**`focused`**
Type: `boolean`
Description: Whether the input is focused.

**`invalid`**
Type: `boolean`
Description: Whether the input is invalid.

**`empty`**
Type: `boolean`
Description: Whether the input value is empty.

**`value`**
Type: `string`
Description: The formatted value of the input.

**`valueAsNumber`**
Type: `number`
Description: The value of the input as a number.

**`setValue`**
Type: `(value: number) => void`
Description: Function to set the value of the input.

**`clearValue`**
Type: `() => void`
Description: Function to clear the value of the input.

**`increment`**
Type: `() => void`
Description: Function to increment the value of the input by the step.

**`decrement`**
Type: `() => void`
Description: Function to decrement the value of the input by the step.

**`setToMax`**
Type: `() => void`
Description: Function to set the value of the input to the max.

**`setToMin`**
Type: `() => void`
Description: Function to set the value of the input to the min.

**`focus`**
Type: `() => void`
Description: Function to focus the input.

### Data Attributes

**`Root`**

**`data-scope`**: number-input
**`data-part`**: root
**`data-disabled`**: Present when disabled
**`data-focus`**: Present when focused
**`data-invalid`**: Present when invalid

**`Label`**

**`data-scope`**: number-input
**`data-part`**: label
**`data-disabled`**: Present when disabled
**`data-focus`**: Present when focused
**`data-invalid`**: Present when invalid

**`Control`**

**`data-scope`**: number-input
**`data-part`**: control
**`data-focus`**: Present when focused
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid

**`ValueText`**

**`data-scope`**: number-input
**`data-part`**: value-text
**`data-disabled`**: Present when disabled
**`data-invalid`**: Present when invalid
**`data-focus`**: Present when focused

**`Input`**

**`data-scope`**: number-input
**`data-part`**: input
**`data-invalid`**: Present when invalid
**`data-disabled`**: Present when disabled

**`DecrementTrigger`**

**`data-scope`**: number-input
**`data-part`**: decrement-trigger
**`data-disabled`**: Present when disabled

**`IncrementTrigger`**

**`data-scope`**: number-input
**`data-part`**: increment-trigger
**`data-disabled`**: Present when disabled

**`Scrubber`**

**`data-scope`**: number-input
**`data-part`**: scrubber
**`data-disabled`**: Present when disabled

## Accessibility

### Keyboard Interactions

**`ArrowUp`**
Description: Increments the value of the number input by a predefined step.

**`ArrowDown`**
Description: Decrements the value of the number input by a predefined step.

**`PageUp`**
Description: Increments the value of the number input by a larger predefined step.

**`PageDown`**
Description: Decrements the value of the number input by a larger predefined step.

**`Home`**
Description: Sets the value of the number input to its minimum allowed value.

**`End`**
Description: Sets the value of the number input to its maximum allowed value.

**`Enter`**
Description: Submits the value entered in the number input.
