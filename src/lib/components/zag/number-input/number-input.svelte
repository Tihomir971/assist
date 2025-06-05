<script lang="ts">
	import './number-input.css';
	import * as numberInput from '@zag-js/number-input';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import type { NumberInputProps } from './types';
	import PhCaretUp from '~icons/ph/caret-up';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import PhNumpad from '~icons/ph/numpad';
	let {
		id,
		value = $bindable(),
		label,
		required,
		locale = 'sr-RS',
		min = 0,
		name,
		fraction = 2,
		onValueChange,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-required': ariaRequired,
		...restProps
	}: NumberInputProps = $props();

	const localeId = $props.id();
	const service = useMachine(numberInput.machine, {
		id: id ?? localeId,
		locale,
		allowMouseWheel: true,
		min,
		required: required || ariaRequired === 'true',
		invalid: ariaInvalid === 'true',
		inputMode: fraction === 0 ? 'numeric' : 'decimal',
		defaultValue: value != null ? value.toLocaleString(locale) : undefined,
		get value() {
			return value != null ? value.toLocaleString(locale) : undefined;
		},
		onValueChange(details) {
			if (isNaN(details.valueAsNumber)) {
				return;
			}
			value = details.valueAsNumber;
			console.log('value', value);

			if (onValueChange) {
				onValueChange(details);
			}
		},
		formatOptions: {
			minimumFractionDigits: fraction,
			maximumFractionDigits: fraction
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

<div {...api.getRootProps()}>
	{#if label}
		<label {...api.getLabelProps()}>
			{label}
			{#if required || ariaRequired === 'true'}
				<span class="text-warning">*</span>
			{/if}
		</label>
	{/if}
	<div
		{...api.getControlProps()}
		class="flex h-9 w-full min-w-0 rounded-md border-input bg-background shadow-xs ring-offset-background dark:bg-input/30"
	>
		<div
			class="absolute top-0 left-0 flex h-full w-8 items-center justify-center border-r text-muted-foreground"
		>
			<PhNumpad />
		</div>
		<input {...api.getInputProps()} aria-describedby={ariaDescribedBy} />
		<div class="absolute top-0 right-0 flex h-full w-6 flex-col items-center border-l">
			{#if !restProps.readOnly}
				<button {...api.getIncrementTriggerProps()}>
					<PhCaretUp />
				</button>
				<button {...api.getDecrementTriggerProps()}>
					<PhCaretDown />
				</button>
			{:else}
				<div class="flex h-full items-center">
					<PhPencilSimpleSlash />
				</div>
			{/if}
		</div>
	</div>
</div>
