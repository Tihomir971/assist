<script lang="ts">
	import * as numberInput from '@zag-js/number-input';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import BaseInput from './input-base.svelte';

	import PhNumpad from '~icons/ph/numpad';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';

	import type { HTMLInputAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';

	type Props = Omit<HTMLInputAttributes, 'value'> & {
		ref?: HTMLInputElement | null;
		value?: number | null;
		name?: string | undefined; // Name of the input field
		fractionDigits?: number;
		min?: number;
		max?: number;
		locale?: string;
		class?: string;
		error?: string;
		labelText?: string; // New param for label
		inline?: boolean; // New param for positioning
		readOnly?: boolean; // New param for readOnly
	};
	let {
		ref = $bindable(null),
		value = $bindable(),
		fractionDigits = 2,
		min,
		max,
		locale = 'sr-RS',
		readonly = false,
		class: className,
		error,
		labelText,
		inline,
		readOnly = false,
		...restProps
	}: Props = $props();

	const id = $props.id();
	const service = useMachine(numberInput.machine, {
		id,
		readOnly: readOnly,
		// name: restProps.name,
		// defaultValue: value?.toString(),
		defaultValue: value?.toLocaleString('sr-RS') ?? undefined,
		min: min,
		max: max,
		allowMouseWheel: true,
		locale: locale,
		formatOptions: {
			minimumFractionDigits: fractionDigits,
			maximumFractionDigits: fractionDigits
		},
		onValueChange({ valueAsNumber, value: valueAsString }) {
			console.log('value, valueAsNumber, valueAsString entry', value, valueAsNumber, valueAsString);
			if (value !== valueAsNumber && valueAsNumber) {
				value = valueAsNumber;
			}
			console.log('value, valueAsNumber, valueAsString after', value, valueAsNumber);
		}
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
	{#if !restProps.disabled}
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
	<BaseInput bind:ref {inline} {Label} {Icon} {Content} Action={Trigger} readonly={readOnly} />
</div>
