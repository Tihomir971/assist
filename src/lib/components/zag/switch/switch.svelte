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
		invalid = false,
		label,
		inline
	}: SwitchProps = $props();

	const id = $props.id();
	const service = useMachine(zagSwitch.machine, {
		id,
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

<main class="switch">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label {...api.getRootProps()}>
		<input {...api.getHiddenInputProps()} data-testid="hidden-input" />
		<span {...api.getControlProps()}>
			<span {...api.getThumbProps()}></span>
		</span>
		<span {...api.getLabelProps()}>{label}</span>{#if required}
			<span class="text-warning">*</span>
		{/if}
	</label>
</main>
