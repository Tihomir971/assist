<script lang="ts">
	import * as numberInput from '@zag-js/number-input';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import BaseInput from './input-base.svelte';

	import PhNumpad from '~icons/ph/numpad';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';

	import { untrack } from 'svelte';

	type Props = {
		ref?: HTMLInputElement | null;
		name?: string;
		value?: number | null;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		fractions?: number;
		error?: string;
		labelText?: string; // New param for label
		inline?: boolean; // New param for positioning
		machine?: Pick<
			numberInput.Props,
			| 'locale'
			| 'readOnly'
			| 'min'
			| 'max'
			| 'disabled'
			| 'required'
			| 'defaultValue'
			| 'id'
			| 'onValueChange'
			| 'formatOptions'
			| 'disabled'
		>;
	};

	const id = $props.id();
	let {
		ref = $bindable(null),
		value = $bindable(),
		disabled,
		readonly,
		required,
		fractions = 2,
		error,
		labelText,
		inline,
		machine = {
			id: id,
			locale: 'sr-RS',
			min: 0,
			disabled,
			onValueChange({ valueAsNumber }) {
				if (value !== valueAsNumber && valueAsNumber) {
					value = valueAsNumber;
				}
			}
		},
		...restProps
	}: Props = $props();

	machine.defaultValue = value?.toLocaleString('sr-RS') ?? undefined;
	machine.disabled = disabled;
	machine.readOnly = readonly;
	machine.required = required;
	machine.formatOptions = {
		minimumFractionDigits: fractions,
		maximumFractionDigits: fractions
	};

	const service = useMachine(numberInput.machine, {
		id: machine.id,
		readOnly: machine.readOnly,
		defaultValue: machine.defaultValue,
		min: machine.min,
		max: machine.max,
		locale: machine.locale,
		formatOptions: machine.formatOptions,
		onValueChange: machine.onValueChange
	});
	const api = $derived(numberInput.connect(service, normalizeProps));

	$effect(() => {
		if (value !== untrack(() => api.valueAsNumber)) {
			api.setValue(value ?? 0);
		}
	});
</script>

{#snippet Label()}
	{#if labelText}
		<label {...api.getLabelProps()} class="input-label">{labelText}:</label>
	{/if}
{/snippet}

{#snippet Icon()}
	<PhNumpad />
{/snippet}

{#snippet Content()}
	<input {...api.getInputProps()} class="w-full focus:outline-none" />
{/snippet}

{#snippet Trigger()}
	{#if !machine.disabled}
		<div class="flex h-full gap-1">
			<button
				{...api.getDecrementTriggerProps()}
				class="flex h-full items-center justify-center rounded-sm hover:text-primary-foreground"
				aria-label="Decrement"
			>
				<PhMinus />
			</button>
			<button
				{...api.getIncrementTriggerProps()}
				class="flex h-full items-center justify-center rounded-sm hover:text-primary-foreground"
				aria-label="Increment"
			>
				<PhPlus />
			</button>
		</div>
	{/if}
{/snippet}

<input type="hidden" name={restProps.name} value={api.valueAsNumber} />

<div {...api.getRootProps()} class="input-root">
	<BaseInput
		bind:ref
		{inline}
		{Label}
		{Icon}
		{Content}
		Action={Trigger}
		readonly={machine.readOnly}
	/>
</div>
