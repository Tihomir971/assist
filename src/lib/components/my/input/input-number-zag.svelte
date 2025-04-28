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
		error?: string;
		formatOptions?: Intl.NumberFormatOptions | undefined;
		fractions?: number;
		labelText?: string; // New param for label
		inline?: boolean; // New param for positioning
		locale?: string | undefined;
		readonly?: boolean;
		required?: boolean;
		machine?: numberInput.Props;
	};

	const id = $props.id();
	let {
		ref = $bindable(null),
		value = $bindable(),
		name,
		disabled,
		readonly,
		required,
		fractions = 2,
		labelText,
		inline,
		machine = {
			id,
			readOnly: readonly,
			disabled: disabled,
			required: required,

			defaultValue: value?.toLocaleString('sr-RS'),
			min: 0,
			formatOptions: {
				minimumFractionDigits: fractions,
				maximumFractionDigits: fractions
			},
			onValueChange: ({ valueAsNumber }) => {
				value = valueAsNumber;
			},
			locale: 'sr-RS',
			pattern: '^[0-9]{1,3}(\\.[0-9]{3})*(,[0-9]+)?$|^[0-9]+(,[0-9]+)?$'
		}
	}: Props = $props();
	console.log('machine', machine);
	const service = useMachine(numberInput.machine, {
		get value() {
			return value?.toLocaleString('sr-RS');
		},
		...machine
	});
	const api = $derived(numberInput.connect(service, normalizeProps));

	/* 	$effect(() => {
		if (value !== untrack(() => api.valueAsNumber)) {
			api.setValue(value ?? 0);
		}
	}); */
	$inspect('machine', machine);
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
	{#if !disabled}
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

<input type="hidden" {name} value={api.valueAsNumber} />

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
