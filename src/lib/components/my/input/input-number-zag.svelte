<script lang="ts">
	import * as numberInput from '@zag-js/number-input';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import PhNumpad from '~icons/ph/numpad';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';

	type Props = {
		ref?: HTMLInputElement | null;
		name?: string;
		value?: number | null;
		disabled?: boolean;
		error?: string;
		formatOptions?: Intl.NumberFormatOptions | undefined;
		fractions?: number;
		label?: string; // New param for label
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
		label,
		inline,
		machine = {
			disabled: disabled,
			readOnly: readonly,
			required: required,
			pattern: '^[0-9]{1,3}(\\.[0-9]{3})*(,[0-9]+)?$|^[0-9]+(,[0-9]+)?$',
			defaultValue: value != null ? value.toLocaleString('sr-RS') : undefined,
			min: 0,
			allowMouseWheel: true,
			formatOptions: {
				minimumFractionDigits: fractions,
				maximumFractionDigits: fractions
			},
			onValueChange: ({ value: newValue, valueAsNumber }) => {
				console.log('value,valueAsNumber', newValue, valueAsNumber);

				value = valueAsNumber;
			},
			locale: 'sr-RS',
			id: id
		}
	}: Props = $props();
	const service = useMachine(numberInput.machine, {
		get value() {
			return value != null ? value.toLocaleString('sr-RS') : undefined;
		},
		...machine
	});
	const api = $derived(numberInput.connect(service, normalizeProps));
</script>

{#snippet Label()}
	{#if label}
		<label {...api.getLabelProps()} class="input-label">{label}</label>
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

<input
	type="hidden"
	{name}
	value={Number.isNaN(api.valueAsNumber) ? undefined : api.valueAsNumber}
/>

<!-- <div {...api.getRootProps()} class="input-root">
	<BaseInput
		bind:ref
		{inline}
		{Label}
		{Icon}
		{Content}
		Action={Trigger}
		readonly={machine.readOnly}
	/>
</div> -->

<div {...api.getRootProps()} class="input-root">
	{#if label}
		<div class="flex items-center justify-between">
			<div>
				<label {...api.getLabelProps()} class="input-label">{label}:</label>
				<!-- {#if $constraints?.required}
				<span class="text-warning">*</span>
			{/if} -->
			</div>
		</div>
	{/if}
	<div {...api.getControlProps()} class="input-control data-disabled:opacity-50">
		<div class="input-icon">
			<PhNumpad />
		</div>
		<div class="input-input">
			<input {...api.getInputProps()} class="w-full focus:outline-none" />
		</div>
		{#if !disabled}
			<div class="input-trigger">
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
	</div>
</div>
