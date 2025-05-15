<script lang="ts">
	import * as numberInput from '@zag-js/number-input';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import type { NumberInputProps } from './types';
	import PhNumpad from '~icons/ph/numpad';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';

	let {
		value = $bindable(),
		label,
		required,
		locale = 'sr-RS',
		allowMouseWheel = true,
		min = 0,
		name,
		...restProps
	}: NumberInputProps = $props();

	const id = $props.id();
	const service = useMachine(numberInput.machine, {
		id,
		locale,
		allowMouseWheel,
		min,
		defaultValue: value != null ? value.toLocaleString(locale) : undefined,
		get value() {
			return value != null ? value.toLocaleString(locale) : undefined;
		},
		onValueChange({ valueAsNumber }) {
			value = valueAsNumber;
		},
		...restProps
	});

	const api = $derived(numberInput.connect(service, normalizeProps));
</script>

<input
	type="hidden"
	{name}
	value={Number.isNaN(api.valueAsNumber) ? undefined : api.valueAsNumber}
/>

<div {...api.getRootProps()} class="input-root">
	<!-- <div data-testid="scrubber" {...api.getScrubberProps()}></div> -->
	<!-- svelte-ignore a11y_label_has_associated_control -->
	{#if label}
		<label data-testid="label" {...api.getLabelProps()} class="input-label">
			{label}
			{#if required}
				<span class="text-warning">*</span>
			{/if}
		</label>
	{/if}
	<div {...api.getControlProps()} class="input-control">
		<div class="input-icon">
			<PhNumpad />
		</div>
		<div class="input-input">
			<input data-testid="input" {...api.getInputProps()} class="w-full focus:outline-none" />
		</div>
		<div class="input-trigger">
			{#if !restProps.readOnly}
				<button data-testid="dec-button" {...api.getDecrementTriggerProps()}>
					<PhMinus />
				</button>
				<button data-testid="inc-button" {...api.getIncrementTriggerProps()}>
					<PhPlus />
				</button>
			{:else}
				<PhPencilSimpleSlash />
			{/if}
		</div>
	</div>
</div>
