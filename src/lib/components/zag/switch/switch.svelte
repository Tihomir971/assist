<script lang="ts">
	import './switch.css';

	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import * as zagSwitch from '@zag-js/switch';
	import type { SwitchProps } from './types';

	let {
		name,
		checked = $bindable(),
		required = false,
		disabled = false,
		readOnly = false,
		label,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-required': ariaRequired
	}: SwitchProps = $props();

	const id = $props.id();
	const service = useMachine(zagSwitch.machine, {
		id,
		invalid: ariaInvalid === 'true',
		name,
		disabled,
		readOnly,
		required,
		get checked() {
			return checked;
		},
		onCheckedChange({ checked: newChecked }) {
			checked = newChecked;
		}
	});
	const api = $derived(zagSwitch.connect(service, normalizeProps));
</script>

<label {...api.getRootProps()}>
	<input {...api.getHiddenInputProps()} aria-describedby={ariaDescribedBy} />
	<span
		{...api.getControlProps()}
		class="border border-input bg-background data-[state=checked]:dark:bg-white data-[state=unchecked]:dark:bg-input/30"
	>
		<span {...api.getThumbProps()}></span>
	</span>
	<span {...api.getLabelProps()}>{label}</span>
	{#if required || ariaRequired === 'true'}
		<span class="text-warning">*</span>
	{/if}
</label>
