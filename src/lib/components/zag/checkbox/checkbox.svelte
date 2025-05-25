<script lang="ts">
	import './checkbox.css';
	import * as checkbox from '@zag-js/checkbox';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import type { CheckboxProps } from './types';
	let {
		id,
		name,
		checked = $bindable(),
		disabled,
		readOnly,
		required,
		label,
		onCheckedChange,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-required': ariaRequired
	}: CheckboxProps = $props();

	const localId = $props.id();
	const service = useMachine(checkbox.machine, {
		id: id ?? localId,
		name,
		get checked() {
			return checked;
		},
		disabled,
		readOnly: readOnly || ariaInvalid === 'true',
		required: required || ariaRequired === 'true',
		invalid: ariaInvalid === 'true',
		onCheckedChange(details) {
			checked = details.checked;
			if (onCheckedChange) {
				onCheckedChange(details);
			}
		}
	});

	const api = $derived(checkbox.connect(service, normalizeProps));
</script>

<label {...api.getRootProps()}>
	<div {...api.getControlProps()}></div>
	<span {...api.getLabelProps()}>
		{label}
	</span>
	<input {...api.getHiddenInputProps()} />
</label>
